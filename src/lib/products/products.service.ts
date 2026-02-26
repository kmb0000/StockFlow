import * as productsRepository from "./products.repository";
import { ValidationError } from "../errors/validation.error";
import { createProductSchema, updateProductSchema } from "./products.types";
import { z } from "zod";
import { NotFoundError } from "../errors/not-found.error";
import { ActivityContext } from "../activity_logs/activity-context";
import { logActivity } from "../activity_logs/activity_logs.service";

/**
 * GET ALL
 */
export async function getAllProducts() {
  return productsRepository.findAllProducts();
}

/**
 * CREATE PRODUCT
 */
export async function createProduct(data: unknown, context: ActivityContext) {
  try {
    const parsedData = createProductSchema.parse(data);

    const {
      name,
      description,
      quantity,
      selling_price,
      purchase_price,
      category_id,
      supplier_id,
    } = parsedData;

    const sku = `PROD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    try {
      const product = await productsRepository.createProduct({
        sku,
        name,
        description,
        quantity,
        selling_price,
        purchase_price,
        category_id,
        supplier_id,
      });

      // Log uniquement après succès
      await logActivity({
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        details: {
          name: product.name,
          sku: product.sku,
        },
        context,
      });

      return product;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ValidationError("Un produit avec ce SKU existe déjà");
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
 * GET BY ID
 */
export async function getProductById(id: string) {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const product = await productsRepository.findProductById(parsedId);

    if (!product) {
      throw new NotFoundError("Produit non trouvé");
    }

    return product;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }

    throw error;
  }
}

export async function getProductDetailById(id: string) {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const product = await productsRepository.findProductDetailById(parsedId);

    if (!product) {
      throw new NotFoundError("Produit non trouvé");
    }

    return product;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }

    throw error;
  }
}

/**
 * UPDATE PRODUCT
 */
export async function updateProduct(
  id: string,
  data: unknown,
  context: ActivityContext,
) {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);
    const parsedData = updateProductSchema.parse(data);

    if (Object.keys(parsedData).length === 0) {
      throw new ValidationError("Remplir au moins un champ");
    }

    try {
      const product = await productsRepository.updateProduct(
        parsedId,
        parsedData,
      );

      if (!product) {
        throw new NotFoundError("Produit non trouvé");
      }
      await logActivity({
        action: "UPDATE",
        entityType: "PRODUCT",
        entityId: product.id,
        details: parsedData,
        context,
      });

      return product;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ValidationError("Conflit de données (unicité)");
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
 * DELETE PRODUCT
 */
export async function deleteProduct(
  id: string,
  context: ActivityContext,
): Promise<void> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const deleted = await productsRepository.deleteProduct(parsedId);

    if (!deleted) {
      throw new NotFoundError("Produit non trouvé");
    }

    await logActivity({
      action: "DELETE",
      entityType: "PRODUCT",
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
