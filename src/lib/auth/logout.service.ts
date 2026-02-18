import * as refreshTokenRepository from "../refresh_tokens/refresh_tokens.repository";
import { hashRefreshToken } from "./refresh-token";
import { ValidationError } from "../errors/validation.error";
import { logActivity } from "../activity_logs/activity_logs.service";
import { ActivityContext } from "../activity_logs/activity-context";

export async function logoutSession(
  refreshToken: string,
  context: ActivityContext,
): Promise<void> {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const storedToken =
    await refreshTokenRepository.findByTokenHash(refreshTokenHash);

  if (!storedToken) {
    throw new ValidationError("Session invalide");
  }

  await refreshTokenRepository.deleteByUserId(storedToken.user_id);

  await logActivity({
    action: "LOGOUT",
    entityType: "USER",
    entityId: storedToken.user_id,
    details: null,
    context,
  });
}
