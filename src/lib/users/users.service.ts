import { z } from "zod";
import * as usersRepository from "./users.repository";
import { User, UpdateUserInput } from "./users.types";
import { hashPassword } from "../auth/password";
import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/not-found.error";
import { ActivityContext } from "../activity_logs/activity-context";
import { logActivity } from "../activity_logs/activity_logs.service";

// ============================================================
// SCHEMAS ZOD
// ============================================================

const createUserSchema = z.object({
  email: z.email("Format d'email invalide"),
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    error: "Rôle invalide",
  }),
  avatar_url: z.url("Format d'URL invalide").nullable().optional(),
  is_active: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .optional(),
  email: z.email("Format d'email invalide").optional(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .optional(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
  avatar_url: z.union([z.url("Format d'URL invalide"), z.null()]).optional(),
  is_active: z.boolean().optional(),
});

// ============================================================
// HELPERS
// ============================================================

/**
 * Gère les erreurs de contrainte d'unicité PostgreSQL (email déjà utilisé)
 */
function handleUniqueConstraint(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  ) {
    throw new ValidationError("Un utilisateur avec cet email existe déjà");
  }
  throw error;
}

/**
 * Transforme les erreurs Zod en ValidationError formatée
 */
function handleZodError(error: unknown): never {
  if (error instanceof z.ZodError) {
    const formattedErrors: Record<string, string> = {};
    error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      formattedErrors[field] = issue.message;
    });
    throw new ValidationError("Validation échouée", formattedErrors);
  }
  throw error;
}

// ============================================================
// GET ALL
// ============================================================

export async function getAllUsers(): Promise<Omit<User, "password_hash">[]> {
  return usersRepository.findAll();
}

// ============================================================
// GET BY ID
// ============================================================

export async function getUserById(
  id: string,
): Promise<Omit<User, "password_hash">> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const user = await usersRepository.findById(parsedId);

    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    // On ne retourne jamais le password_hash
    const { password_hash: _, ...userSafe } = user;
    return userSafe;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }
    throw error;
  }
}

// ============================================================
// CREATE
// ============================================================

export async function createUser(
  data: unknown,
  context: ActivityContext,
): Promise<Omit<User, "password_hash">> {
  try {
    const parsed = createUserSchema.parse(data);

    // Hash du mot de passe avant insertion
    const password_hash = await hashPassword(parsed.password);

    try {
      const user = await usersRepository.createUser({
        email: parsed.email,
        name: parsed.name,
        password_hash,
        role: parsed.role,
        avatar_url: parsed.avatar_url ?? null,
        is_active: parsed.is_active ?? true,
      });

      await logActivity({
        action: "CREATE",
        entityType: "USER",
        entityId: user.id,
        details: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        context,
      });

      return user;
    } catch (error) {
      handleUniqueConstraint(error);
    }
  } catch (error) {
    handleZodError(error);
  }
}

// ============================================================
// UPDATE
// ============================================================

export async function updateUser(
  id: string,
  data: unknown,
  context: ActivityContext,
): Promise<Omit<User, "password_hash">> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);
    const parsed = updateUserSchema.parse(data);

    if (Object.keys(parsed).length === 0) {
      throw new ValidationError("Remplir au moins un champ");
    }

    // Si un nouveau mot de passe est fourni, on le hash
    const updateData: UpdateUserInput = { ...parsed };
    if (parsed.password) {
      updateData.password_hash = await hashPassword(parsed.password);
      delete (updateData as Record<string, unknown>).password;
    }

    try {
      const user = await usersRepository.updateUser(parsedId, updateData);

      if (!user) {
        throw new NotFoundError("Utilisateur non trouvé");
      }

      await logActivity({
        action: "UPDATE",
        entityType: "USER",
        entityId: user.id,
        details: {
          ...parsed,
          // On ne log jamais le mot de passe
          password: parsed.password ? "[modifié]" : undefined,
        },
        context,
      });

      return user;
    } catch (error) {
      handleUniqueConstraint(error);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }
    throw error;
  }
}

// ============================================================
// DELETE
// ============================================================

export async function deleteUser(
  id: string,
  context: ActivityContext,
): Promise<void> {
  try {
    const parsedId = z.uuid("ID invalide").parse(id);

    const deleted = await usersRepository.deleteUser(parsedId);

    if (!deleted) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    await logActivity({
      action: "DELETE",
      entityType: "USER",
      entityId: parsedId,
      details: null,
      context,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("ID invalide");
    }
    throw error;
  }
}
