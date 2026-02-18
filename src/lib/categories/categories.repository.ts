import { db } from "../db/connection";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.types";

/**
 * Création dynamique d’une catégorie
 */
export async function createCategory(
  data: CreateCategoryInput,
): Promise<Category> {
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      columns.push(key);
      placeholders.push(`$${values.length + 1}`);
      values.push(value);
    }
  });

  if (columns.length === 0) {
    throw new Error("Aucun champ fourni pour la création de catégorie");
  }

  const { rows } = await db.query<Category>(
    `
    INSERT INTO categories (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING
      id,
      name,
      description,
      color,
      icon,
      created_at,
      updated_at
    `,
    values,
  );

  const row = rows[0];

  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/**
 * Récupération de toutes les catégories
 */
export async function findAllCategories(): Promise<Category[]> {
  const { rows } = await db.query<Category>(
    `
    SELECT
      id,
      name,
      description,
      color,
      icon,
      created_at,
      updated_at
    FROM categories
    ORDER BY created_at DESC
    `,
  );

  return rows.map((row) => ({
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

/**
 * Récupération d’une catégorie par ID
 */
export async function findCategoryById(id: string): Promise<Category | null> {
  const { rows } = await db.query<Category>(
    `
    SELECT
      id,
      name,
      description,
      color,
      icon,
      created_at,
      updated_at
    FROM categories
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/**
 * Mise à jour partielle dynamique d’une catégorie
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
): Promise<Category | null> {
  const fields = Object.keys(data);

  if (fields.length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  fields.forEach((field, index) => {
    setClauses.push(`${field} = $${index + 1}`);
    values.push(data[field as keyof UpdateCategoryInput]);
  });

  const { rows } = await db.query<Category>(
    `
    UPDATE categories
    SET ${setClauses.join(", ")}
    WHERE id = $${fields.length + 1}
    RETURNING
      id,
      name,
      description,
      color,
      icon,
      created_at,
      updated_at
    `,
    [...values, id],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/**
 * Suppression d’une catégorie
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const result = await db.query(`DELETE FROM categories WHERE id = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}
