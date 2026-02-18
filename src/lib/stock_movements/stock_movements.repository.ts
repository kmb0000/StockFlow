import { PoolClient } from "pg";
import { db, pool } from "../db/connection";
import {
  InsertStockMovementData,
  StockMovement,
} from "./stock_movements.types";

export async function create(
  data: InsertStockMovementData,
  client?: PoolClient,
): Promise<StockMovement> {
  const executor = client ?? pool;

  const result = await executor.query<StockMovement>(
    `INSERT INTO stock_movements (product_id, created_by, type, quantity, reason, notes, reference, unit_price, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING 
        id,
        product_id,
        created_by,
        type,
        quantity,
        reason,
        notes,
        reference,
        unit_price,
        validated_by,
        validated_at,
        status,
        created_at`,
    [
      data.product_id,
      data.created_by,
      data.type,
      data.quantity,
      data.reason,
      data.notes,
      data.reference,
      data.unit_price,
      data.status,
    ],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("Insert échoué");
  }

  return {
    ...row,
    created_at: new Date(row.created_at),
    validated_at: row.validated_at ? new Date(row.validated_at) : null,
  };
}

export async function getById(
  id: string,
  client?: PoolClient,
): Promise<StockMovement | null> {
  const executor = client ?? pool;

  const result = await executor.query<StockMovement>(
    `SELECT id, product_id,
      created_by,
      type,
      quantity,
      reason,
      notes,
      reference,
      unit_price,
      validated_by,
      validated_at,
      status,
      created_at
      FROM stock_movements WHERE id = $1 FOR UPDATE`,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    ...row,
    created_at: new Date(row.created_at),
    validated_at: row.validated_at ? new Date(row.validated_at) : null,
  };
}

export async function markValidated(
  id: string,
  userId: string,
  client?: PoolClient,
): Promise<StockMovement | null> {
  const executor = client ?? pool;

  const result = await executor.query<StockMovement>(
    `UPDATE stock_movements SET status = 'VALIDATED', validated_by = $1, validated_at = NOW() WHERE id = $2 RETURNING id,
      product_id,
      created_by,
      type,
      quantity,
      reason,
      notes,
      reference,
      unit_price,
      validated_by,
      validated_at,
      status,
      created_at`,
    [userId, id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    ...row,
    created_at: new Date(row.created_at),
    validated_at: row.validated_at ? new Date(row.validated_at) : null,
  };
}

export async function findAll(): Promise<StockMovement[]> {
  // Requête simple, pas besoin de transaction
  const { rows } = await db.query<StockMovement>(
    `
    SELECT
      id,
      product_id,
      created_by,
      type,
      quantity,
      reason,
      notes,
      reference,
      unit_price,
      validated_by,
      validated_at,
      status,
      created_at
    FROM stock_movements
    ORDER BY created_at DESC
    `,
  );

  // Transformation des dates (PostgreSQL → string → Date)
  return rows.map((row) => ({
    ...row,
    created_at: new Date(row.created_at),
    validated_at: row.validated_at ? new Date(row.validated_at) : null,
  }));
}

export async function markRejected(
  id: string,
  userId: string,
  client?: PoolClient,
): Promise<StockMovement | null> {
  // Si on est dans une transaction → on utilise le client
  // Sinon → on utilise le pool normal
  const executor = client ?? pool;

  const result = await executor.query<StockMovement>(
    `
    UPDATE stock_movements
    SET
      status = 'REJECTED',
      validated_by = $1,
      validated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      product_id,
      created_by,
      type,
      quantity,
      reason,
      notes,
      reference,
      unit_price,
      validated_by,
      validated_at,
      status,
      created_at
    `,
    [userId, id],
  );

  const row = result.rows[0];

  // Si aucune ligne mise à jour → null
  if (!row) {
    return null;
  }

  // Transformation des dates pour correspondre à l'interface
  return {
    ...row,
    created_at: new Date(row.created_at),
    validated_at: row.validated_at ? new Date(row.validated_at) : null,
  };
}
