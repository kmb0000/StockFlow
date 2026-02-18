import { ValidationError } from "../errors/validation.error";
import * as usersRepository from "../users/users.repository";
import { UserSafe } from "../users/users.types";
import { loginSchema } from "./auth.types";
import { signToken } from "./jwt";
import { comparePassword } from "./password";
import { generateRefreshToken, hashRefreshToken } from "./refresh-token";
import * as refreshTokenRepository from "../refresh_tokens/refresh_tokens.repository";
import { logActivity } from "../activity_logs/activity_logs.service";
import { ActivityContext } from "../activity_logs/activity-context";

export async function login(
  data: unknown,
  context: ActivityContext,
): Promise<{ token: string; refreshToken: string; user: UserSafe }> {
  // Validation structurelle
  const parsed = loginSchema.parse(data);

  // Recherche utilisateur
  const user = await usersRepository.findByEmail(parsed.email);

  if (!user || !user.is_active) {
    throw new ValidationError("Informations invalides");
  }

  // Vérification mot de passe
  const isValidPassword = await comparePassword(
    parsed.password,
    user.password_hash,
  );

  if (!isValidPassword) {
    throw new ValidationError("Informations invalides");
  }

  // Génération access token (15 min)
  const token = await signToken({
    id: user.id,
    role: user.role,
  });

  // Génération refresh token (30 jours)
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Upsert en base (1 token par user)
  await refreshTokenRepository.upsertRefreshToken(
    user.id,
    refreshTokenHash,
    expiresAt,
  );

  // Construction user safe
  const userSafe: UserSafe = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
  };

  await logActivity({
    action: "LOGIN",
    entityType: "USER",
    entityId: user.id,
    details: null,
    context,
  });

  return {
    token,
    refreshToken,
    user: userSafe,
  };
}
