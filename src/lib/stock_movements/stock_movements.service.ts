import { db } from "../db/connection";
import {
  createStockMovementSchema,
  InsertStockMovementData,
  StockMovement,
} from "./stock_movements.types";
import * as stockMovementRepository from "./stock_movements.repository";
import * as productRepository from "../products/products.repository";
import { NotFoundError } from "../errors/not-found.error";
import { ValidationError } from "../errors/validation.error";
import { ActivityContext } from "../activity_logs/activity-context";
import { logActivity } from "../activity_logs/activity_logs.service";

export async function createStockMovement(
  userId: string,
  data: unknown,
  context: ActivityContext,
): Promise<StockMovement> {
  const parsed = createStockMovementSchema.parse(data);

  const insertData: InsertStockMovementData = {
    product_id: parsed.product_id,
    created_by: userId,
    type: parsed.type,
    quantity: parsed.quantity,
    reason: parsed.reason,
    notes: parsed.notes ?? null,
    reference: parsed.reference ?? null,
    unit_price: parsed.unit_price ?? null,
    status: "PENDING",
  };

  const movement = await stockMovementRepository.create(insertData);

  await logActivity({
    action: "CREATE",
    entityType: "STOCK_MOVEMENT",
    entityId: movement.id,
    details: {
      type: movement.type,
      quantity: movement.quantity,
      product_id: movement.product_id,
    },
    context,
  });

  return movement;
}

export async function validateStockMovement(
  movementId: string,
  userId: string,
  context: ActivityContext,
): Promise<StockMovement> {
  const client = await db.getClient();

  try {
    //  Démarrer la transaction
    await client.query("BEGIN");

    //  Récupérer le mouvement (verrouillé via FOR UPDATE dans le repo)
    const movement = await stockMovementRepository.getById(movementId, client);

    if (!movement) {
      throw new NotFoundError("Mouvement introuvable");
    }

    if (movement.status !== "PENDING") {
      throw new ValidationError(
        "Seuls les mouvements en attente peuvent être validés",
      );
    }

    // Récupérer le produit (verrouillé via FOR UPDATE dans le repo)
    const product = await productRepository.getById(
      movement.product_id,
      client,
    );

    if (!product) {
      throw new NotFoundError("Produit introuvable");
    }

    if (product.status === "archived") {
      throw new ValidationError(
        "Impossible de valider un mouvement sur un produit archivé",
      );
    }

    //  Vérification du stock si OUT
    if (movement.type === "OUT") {
      if (product.quantity < movement.quantity) {
        throw new ValidationError("Stock insuffisant");
      }
    }

    // Calcul nouvelle quantité
    const newQuantity =
      movement.type === "IN"
        ? product.quantity + movement.quantity
        : product.quantity - movement.quantity;

    // Mise à jour du stock
    const stockUpdate = await productRepository.updateStockQuantity(
      movement.product_id,
      newQuantity,
      client,
    );

    if (!stockUpdate) {
      throw new Error("Erreur lors de la mise à jour du stock");
    }

    //  Marquer le mouvement comme VALIDATED
    const updatedMovement = await stockMovementRepository.markValidated(
      movementId,
      userId,
      client,
    );

    if (!updatedMovement) {
      throw new Error("Erreur lors de la validation du mouvement");
    }

    //  Commit final
    await client.query("COMMIT");

    await logActivity({
      action: "VALIDATE",
      entityType: "STOCK_MOVEMENT",
      entityId: updatedMovement.id,
      details: {
        product_id: updatedMovement.product_id,
        quantity: updatedMovement.quantity,
        type: updatedMovement.type,
      },
      context,
    });

    //  Retourner le mouvement validé
    return updatedMovement;
  } catch (error) {
    // Si erreur → rollback complet
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Toujours libérer la connexion
    client.release();
  }
}

export async function getAllStockMovements() {
  return stockMovementRepository.findAll();
}

export async function getStockMovementById(id: string) {
  const movement = await stockMovementRepository.getById(id);

  if (!movement) {
    throw new NotFoundError("Mouvement introuvable");
  }

  return movement;
}

export async function rejectStockMovement(
  id: string,
  userId: string,
  context: ActivityContext,
) {
  const movement = await stockMovementRepository.getById(id);

  if (!movement) {
    throw new NotFoundError("Mouvement introuvable");
  }

  if (movement.status !== "PENDING") {
    throw new ValidationError(
      "Seuls les mouvements en attente peuvent être rejetés",
    );
  }

  const rejected = await stockMovementRepository.markRejected(id, userId);

  if (!rejected) {
    throw new Error("Erreur lors du rejet du mouvement");
  }

  await logActivity({
    action: "REJECT",
    entityType: "STOCK_MOVEMENT",
    entityId: rejected.id,
    details: {
      product_id: rejected.product_id,
      quantity: rejected.quantity,
      type: rejected.type,
    },
    context,
  });

  return rejected;
}
