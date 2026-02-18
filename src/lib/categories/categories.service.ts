import {
  createCategorySchema,
  Category,
  updateCategorySchema,
} from "./categories.types";
import * as categoryRepository from "./categories.repository";
import { ValidationError } from "../errors/validation.error";
import { z } from "zod";
import { NotFoundError } from "../errors/not-found.error";
import { ActivityContext } from "../activity_logs/activity-context";
import { logActivity } from "../activity_logs/activity_logs.service";

/**
 * CREATE CATEGORIE
 */
export async function createCategory(
  data: unknown,
  context: ActivityContext,
): Promise<Category> {
  try {
    const parseData = createCategorySchema.parse(data);

    try {
      const category = await categoryRepository.createCategory(parseData);

      await logActivity({
        action: "CREATE",
        entityType: "CATEGORY",
        entityId: category.id,
        details: {
          name: category.name,
        },
        context,
      });

      return category;
    } catch (error: unknown) {
      // Code PostgreSQL pour unique_violation
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ValidationError("Une catégorie avec ce nom existe déjà");
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
 * DELETE
 */
export async function deleteCategory(
  id: string,
  context: ActivityContext,
): Promise<void> {
  try {
    // Validation UUID
    const parsedId = z.uuid("ID invalide").parse(id);

    // Suppression en base
    const deleted = await categoryRepository.deleteCategory(parsedId);

    // Si aucune ligne supprimée → ressource inexistante
    if (!deleted) {
      throw new NotFoundError("Catégorie non trouvée");
    }

    await logActivity({
      action: "DELETE",
      entityType: "CATEGORY",
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

/**
 * GET ALL
 */
export async function getAllCategories(): Promise<Category[]> {
  return categoryRepository.findAllCategories();
}

/**
 * GET BY ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);
    const category = await categoryRepository.findCategoryById(parsedId);

    if (!category) {
      throw new NotFoundError("Catégorie non trouvée");
    }

    return category;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }
    throw error;
  }
}

/**
 * UPDATE CATEGORIE
 */
export async function updateCategory(
  id: string,
  data: unknown,
  context: ActivityContext,
): Promise<Category> {
  try {
    //Validation UUID
    const parsedId = z.uuid("ID invalide").parse(id);

    //Validation Body
    const parsedData = updateCategorySchema.parse(data);

    //Protection contre body vide
    if (Object.keys(parsedData).length === 0) {
      throw new ValidationError("Remplir au moins un champ");
    }

    const category = await categoryRepository.updateCategory(
      parsedId,
      parsedData,
    );

    //Gestion du null
    if (!category) {
      throw new NotFoundError("Catégorie non trouvée");
    }

    await logActivity({
      action: "UPDATE",
      entityType: "CATEGORY",
      entityId: category.id,
      details: parsedData,
      context,
    });

    return category;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Données invalides");
    }
    throw error;
  }
}
