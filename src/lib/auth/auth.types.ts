import { z } from "zod";

/**
 * Rôles autorisés dans l'application.
 * Aligné avec la contrainte CHECK en base de données.
 */
export const USER_ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Schéma de validation pour le login.
 * Valide uniquement la structure HTTP entrante.
 */
export const loginSchema = z.object({
  email: z.email("Identifiants invalides").trim(),

  password: z.string().min(6, "Identifiants invalides"),
});

/**
 * Type TypeScript inféré automatiquement depuis le schéma.
 */
export type LoginInput = z.infer<typeof loginSchema>;
