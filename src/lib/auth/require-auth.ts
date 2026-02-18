import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { ValidationError } from "../errors/validation.error";
import { UserRole } from "./auth.types";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

/**
 * Vérifie que l'utilisateur est authentifié.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new ValidationError("Non autorisé");
  }

  try {
    const payload = await verifyToken(accessToken);

    return {
      id: payload.id,
      role: payload.role as UserRole,
    };
  } catch {
    throw new ValidationError("Token invalide");
  }
}

/**
 * Vérifie que l'utilisateur possède un des rôles autorisés.
 */
export async function requireRole(
  allowedRoles: UserRole[],
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new ValidationError("Accès refusé");
  }

  return user;
}
