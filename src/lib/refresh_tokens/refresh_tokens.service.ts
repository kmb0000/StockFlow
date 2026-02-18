import { hashRefreshToken, generateRefreshToken } from "../auth/refresh-token";
import * as refreshTokenRepository from "../refresh_tokens/refresh_tokens.repository";
import * as usersRepository from "../users/users.repository";
import { signToken } from "../auth/jwt";
import { ValidationError } from "../errors/validation.error";
import { RefreshResult } from "./refresh_tokens.types";

export async function refreshSession(
  refreshToken: string,
): Promise<RefreshResult> {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const storedToken =
    await refreshTokenRepository.findByTokenHash(refreshTokenHash);

  if (!storedToken) {
    throw new ValidationError("Session invalide");
  }

  if (storedToken.revoked_at) {
    throw new ValidationError("Session révoquée");
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    throw new ValidationError("Session expirée");
  }

  const user = await usersRepository.findById(storedToken.user_id);

  if (!user || !user.is_active) {
    throw new ValidationError("Utilisateur invalide");
  }

  // Nouveau access token
  const newAccessToken = await signToken({
    id: user.id,
    role: user.role,
  });

  // Rotation refresh token
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 30);

  await refreshTokenRepository.upsertRefreshToken(
    user.id,
    newRefreshTokenHash,
    newExpiresAt,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
