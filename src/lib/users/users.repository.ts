import { db } from "../db/connection";
import { User } from "./users.types";

export async function findByEmail(email: string): Promise<User | null> {
  const result = await db.query<User>(
    `SELECT id, email, name, password_hash, role, avatar_url, is_active, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)`,
    [email],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

export async function findById(id: string): Promise<User | null> {
  const result = await db.query<User>(
    `
      SELECT 
        id,
        email,
        name,
        password_hash,
        role,
        avatar_url,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}
