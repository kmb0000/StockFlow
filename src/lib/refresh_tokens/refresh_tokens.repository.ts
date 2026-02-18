import { db } from "../db/connection";
import { RefreshToken } from "./refresh_tokens.types";

/**
 * Trouve le refresh token par user_id.
 */
export async function findByUserId(
  userId: string,
): Promise<RefreshToken | null> {
  const result = await db.query<RefreshToken>(
    `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        created_at
      FROM refresh_tokens
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

/**
 * Crée ou remplace le refresh token d'un user.
 * (UNIQUE user_id en base)
 */
export async function upsertRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await db.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET
        token_hash = EXCLUDED.token_hash,
        expires_at = EXCLUDED.expires_at,
        revoked_at = NULL,
        created_at = NOW()
    `,
    [userId, tokenHash, expiresAt],
  );
}

/**
 * Révoque le refresh token d'un user.
 */
export async function revokeByUserId(userId: string): Promise<void> {
  await db.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1
    `,
    [userId],
  );
}

/**
 * Trouve un refresh token par son hash.
 */
export async function findByTokenHash(
  tokenHash: string,
): Promise<RefreshToken | null> {
  const result = await db.query<RefreshToken>(
    `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        created_at
      FROM refresh_tokens
      WHERE token_hash = $1
      LIMIT 1
    `,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

/**
 * Supprime complètement le refresh token.
 */
export async function deleteByUserId(userId: string): Promise<void> {
  await db.query(
    `
      DELETE FROM refresh_tokens
      WHERE user_id = $1
    `,
    [userId],
  );
}
