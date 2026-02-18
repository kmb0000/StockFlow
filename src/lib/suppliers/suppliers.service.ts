import {
  createSupplierSchema,
  updateSupplierSchema,
  Supplier,
} from "./suppliers.type";
import * as supplierRepository from "./suppliers.repository";
import { z } from "zod";
import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/not-found.error";
import { ActivityContext } from "../activity_logs/activity-context";
import { logActivity } from "../activity_logs/activity_logs.service";

/**
 * CREATE SUPPLIER
 */
export async function createSupplier(
  data: unknown,
  context: ActivityContext,
): Promise<Supplier> {
  try {
    const parsedData = createSupplierSchema.parse(data);

    try {
      const supplier = await supplierRepository.createSupplier(parsedData);

      await logActivity({
        action: "CREATE",
        entityType: "SUPPLIER",
        entityId: supplier.id,
        details: {
          name: supplier.name,
        },
        context,
      });

      return supplier;
    } catch (error: unknown) {
      // Vérification propre TypeScript-safe
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ValidationError("Un fournisseur avec ce nom existe déjà");
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};

      error.issues.forEach((err) => {
        const field = err.path[0] as string;
        formattedErrors[field] = err.message;
      });

      throw new ValidationError("Validation échouée", formattedErrors);
    }

    throw error;
  }
}

/**
 * UPDATE SUPPLIER
 */
export async function updateSupplier(
  id: string,
  data: unknown,
  context: ActivityContext,
): Promise<Supplier> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);
    const parsedData = updateSupplierSchema.parse(data);

    if (Object.keys(parsedData).length === 0) {
      throw new ValidationError("Remplir au moins un champ");
    }

    try {
      const supplier = await supplierRepository.updateSupplier(
        parsedId,
        parsedData,
      );

      if (!supplier) {
        throw new NotFoundError("Fournisseur non trouvé");
      }

      await logActivity({
        action: "UPDATE",
        entityType: "SUPPLIER",
        entityId: supplier.id,
        details: parsedData,
        context,
      });

      return supplier;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ValidationError("Un fournisseur avec ce nom existe déjà");
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Données invalides");
    }

    throw error;
  }
}

/**
 * GET BY ID
 */
export async function getSupplierById(id: string): Promise<Supplier> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const supplier = await supplierRepository.findSupplierById(parsedId);

    if (!supplier) {
      throw new NotFoundError("Fournisseur non trouvé");
    }

    return supplier;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }

    throw error;
  }
}

/**
 * GET ALL
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
  return supplierRepository.findAllSuppliers();
}

/**
 * DELETE
 */
export async function deleteSupplier(
  id: string,
  context: ActivityContext,
): Promise<void> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const deleted = await supplierRepository.deleteSupplier(parsedId);

    if (!deleted) {
      throw new NotFoundError("Fournisseur non trouvé");
    }

    await logActivity({
      action: "DELETE",
      entityType: "SUPPLIER",
      entityId: parsedId,
      details: null,
      context,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }

    throw error;
  }
}
