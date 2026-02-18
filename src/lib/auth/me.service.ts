import * as usersRepository from "../users/users.repository";
import { requireAuth } from "./require-auth";
import { UserSafe } from "../users/users.types";
import { ValidationError } from "../errors/validation.error";

export async function getCurrentUser(): Promise<UserSafe> {
  const authUser = await requireAuth();

  const user = await usersRepository.findById(authUser.id);

  if (!user || !user.is_active) {
    throw new ValidationError("Utilisateur invalide");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
  };
}
