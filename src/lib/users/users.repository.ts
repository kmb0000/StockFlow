import { db } from "../db/connection";
import { User, CreateUserInput, UpdateUserInput } from "./users.types";

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

const USER_FIELDS = `
  id,
  email,
  name,
  role,
  avatar_url,
  is_active,
  created_at,
  updated_at
`;

/**
 * Récupération de tous les utilisateurs
 */
export async function findAll(): Promise<Omit<User, "password_hash">[]> {
  const { rows } = await db.query<Omit<User, "password_hash">>(
    `
    SELECT ${USER_FIELDS}
    FROM users
    ORDER BY created_at ASC
    `,
  );

  return rows.map((row) => ({
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

/**
 * Création dynamique d'un utilisateur
 */
export async function createUser(
  data: CreateUserInput,
): Promise<Omit<User, "password_hash">> {
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
    throw new Error("Aucun champ fourni pour la création de l'utilisateur");
  }

  const { rows } = await db.query<Omit<User, "password_hash">>(
    `
    INSERT INTO users (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING ${USER_FIELDS}
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
 * Mise à jour partielle dynamique d'un utilisateur
 */
export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<Omit<User, "password_hash"> | null> {
  const fields = Object.keys(data);

  if (fields.length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  fields.forEach((field, index) => {
    setClauses.push(`${field} = $${index + 1}`);
    values.push(data[field as keyof UpdateUserInput]);
  });

  // updated_at géré manuellement
  setClauses.push(`updated_at = NOW()`);

  const { rows } = await db.query<Omit<User, "password_hash">>(
    `
    UPDATE users
    SET ${setClauses.join(", ")}
    WHERE id = $${fields.length + 1}
    RETURNING ${USER_FIELDS}
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
 * Suppression d'un utilisateur
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.query(`DELETE FROM users WHERE id = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}
