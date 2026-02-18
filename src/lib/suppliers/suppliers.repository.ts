import { db } from "../db/connection";
import {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
} from "./suppliers.type";

/**
 * Création dynamique d’un fournisseur
 * Seuls les champs définis sont insérés
 */
export async function createSupplier(
  data: CreateSupplierInput,
): Promise<Supplier> {
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
    throw new Error("Aucun champ fourni pour la création du fournisseur");
  }

  const { rows } = await db.query<Supplier>(
    `
    INSERT INTO suppliers (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING
      id,
      name,
      email,
      phone,
      contact_person,
      address,
      city,
      postal_code,
      country,
      website,
      notes,
      is_active,
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
 * Récupération de tous les fournisseurs
 */
export async function findAllSuppliers(): Promise<Supplier[]> {
  const { rows } = await db.query<Supplier>(
    `
    SELECT
      id,
      name,
      email,
      phone,
      contact_person,
      address,
      city,
      postal_code,
      country,
      website,
      notes,
      is_active,
      created_at,
      updated_at
    FROM suppliers
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
 * Récupération d’un fournisseur par ID
 */
export async function findSupplierById(id: string): Promise<Supplier | null> {
  const { rows } = await db.query<Supplier>(
    `
    SELECT
      id,
      name,
      email,
      phone,
      contact_person,
      address,
      city,
      postal_code,
      country,
      website,
      notes,
      is_active,
      created_at,
      updated_at
    FROM suppliers
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
 * Mise à jour partielle dynamique d’un fournisseur
 */
export async function updateSupplier(
  id: string,
  data: UpdateSupplierInput,
): Promise<Supplier | null> {
  const fields = Object.keys(data);

  if (fields.length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  fields.forEach((field, index) => {
    setClauses.push(`${field} = $${index + 1}`);
    values.push(data[field as keyof UpdateSupplierInput]);
  });

  const { rows } = await db.query<Supplier>(
    `
    UPDATE suppliers
    SET ${setClauses.join(", ")}
    WHERE id = $${fields.length + 1}
    RETURNING
      id,
      name,
      email,
      phone,
      contact_person,
      address,
      city,
      postal_code,
      country,
      website,
      notes,
      is_active,
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
 * Suppression d’un fournisseur
 */
export async function deleteSupplier(id: string): Promise<boolean> {
  const result = await db.query(`DELETE FROM suppliers WHERE id = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}
