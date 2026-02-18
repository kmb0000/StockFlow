import crypto from "crypto";

/**
 * Génère un refresh token sécurisé aléatoire.
 * 64 bytes = 128 caractères hex.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

/**
 * Hash un refresh token avec SHA-256.
 * On stocke uniquement le hash en base.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
