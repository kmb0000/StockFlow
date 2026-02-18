import { PoolClient } from "pg";
import { db, pool } from "../db/connection";
import {
  CreateProductData,
  Product,
  ProductWithRelations,
  UpdateProductInput,
} from "./products.types";

/**
 * Récupère tous les produits avec leurs relations
 * (catégorie, fournisseur, créateur)
 */
export async function findAllProducts(): Promise<ProductWithRelations[]> {
  const { rows } = await db.query<ProductWithRelations>(
    `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.description,
      p.quantity,
      p.selling_price,
      p.purchase_price,
      p.status,
      p.created_at,

      c.id    AS category_id,
      c.name  AS category_name,
      c.color AS category_color,
      c.icon  AS category_icon,

      s.id    AS supplier_id,
      s.name  AS supplier_name,

      u.id    AS created_by_id,
      u.name  AS created_by_name,
      u.role  AS created_by_role

    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers  s ON p.supplier_id = s.id
    LEFT JOIN users      u ON p.created_by = u.id
    ORDER BY p.created_at DESC
    `,
  );

  return rows.map((row) => ({
    ...row,
    created_at: new Date(row.created_at),
  }));
}

/**
 * Création d’un produit
 * Insertion sécurisée avec requête paramétrée
 */
export async function createProduct(data: CreateProductData): Promise<Product> {
  const {
    sku,
    name,
    description,
    quantity,
    selling_price,
    purchase_price,
    category_id,
    supplier_id,
  } = data;

  const { rows } = await db.query<Product>(
    `
    INSERT INTO products (
      sku,
      name,
      description,
      quantity,
      selling_price,
      purchase_price,
      category_id,
      supplier_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING
      id,
      sku,
      barcode,
      name,
      description,
      category_id,
      supplier_id,
      created_by,
      purchase_price,
      selling_price,
      tax_rate,
      quantity,
      unit,
      alert_threshold,
      min_quantity,
      max_quantity,
      weight,
      dimensions,
      location,
      tags,
      images,
      status,
      is_available,
      created_at,
      updated_at
    `,
    [
      sku,
      name,
      description ?? null,
      quantity,
      selling_price,
      purchase_price,
      category_id ?? null,
      supplier_id ?? null,
    ],
  );

  const row = rows[0];

  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/**
 * Récupération d’un produit avec relations
 */
export async function findProductById(
  id: string,
): Promise<ProductWithRelations | null> {
  const { rows } = await db.query<ProductWithRelations>(
    `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.description,
      p.quantity,
      p.selling_price,
      p.purchase_price,
      p.status,
      p.created_at,

      c.id    AS category_id,
      c.name  AS category_name,
      c.color AS category_color,
      c.icon  AS category_icon,

      s.id    AS supplier_id,
      s.name  AS supplier_name,

      u.id    AS created_by_id,
      u.name  AS created_by_name,
      u.role  AS created_by_role

    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers  s ON p.supplier_id = s.id
    LEFT JOIN users      u ON p.created_by = u.id
    WHERE p.id = $1
    LIMIT 1
    `,
    [id],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    created_at: new Date(row.created_at),
  };
}

/**
 * Mise à jour partielle dynamique d’un produit
 */
export async function updateProduct(
  id: string,
  data: UpdateProductInput,
): Promise<Product | null> {
  const fields = Object.keys(data);

  if (fields.length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  fields.forEach((field, index) => {
    setClauses.push(`${field} = $${index + 1}`);
    values.push(data[field as keyof UpdateProductInput]);
  });

  const { rows } = await db.query<Product>(
    `
    UPDATE products
    SET ${setClauses.join(", ")}
    WHERE id = $${fields.length + 1}
    RETURNING
      id,
      sku,
      barcode,
      name,
      description,
      category_id,
      supplier_id,
      created_by,
      purchase_price,
      selling_price,
      tax_rate,
      quantity,
      unit,
      alert_threshold,
      min_quantity,
      max_quantity,
      weight,
      dimensions,
      location,
      tags,
      images,
      status,
      is_available,
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
 * Suppression d’un produit
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.query(`DELETE FROM products WHERE id = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

/**
 * Mise à jour du stock (utilisable en transaction)
 */
export async function updateStockQuantity(
  productId: string,
  newQuantity: number,
  client?: PoolClient,
): Promise<{ id: string; quantity: number } | null> {
  const executor = client ?? pool;

  const { rows } = await executor.query<{
    id: string;
    quantity: number;
  }>(
    `
    UPDATE products
    SET quantity = $1
    WHERE id = $2
    RETURNING id, quantity
    `,
    [newQuantity, productId],
  );

  return rows[0] ?? null;
}

/**
 * Récupération d’un produit avec verrouillage (transaction)
 */
export async function getById(
  id: string,
  client?: PoolClient,
): Promise<Product | null> {
  const executor = client ?? pool;

  const { rows } = await executor.query<Product>(
    `
    SELECT
      id,
      sku,
      barcode,
      name,
      description,
      category_id,
      supplier_id,
      created_by,
      purchase_price,
      selling_price,
      tax_rate,
      quantity,
      unit,
      alert_threshold,
      min_quantity,
      max_quantity,
      weight,
      dimensions,
      location,
      tags,
      images,
      status,
      is_available,
      created_at,
      updated_at
    FROM products
    WHERE id = $1
    FOR UPDATE
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
