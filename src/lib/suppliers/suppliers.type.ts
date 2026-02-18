import { z } from "zod";

/**
 * CREATE SUPPLIER
 * - name obligatoire
 * - autres champs optionnels
 * - si email/website présents → doivent être valides
 */
export const createSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom du fournisseur doit contenir au moins 2 caractères"),

  email: z.email("Format d'email invalide").optional(),

  phone: z
    .string()
    .trim()
    .min(1, "Le téléphone ne peut pas être vide")
    .optional(),

  contact_person: z
    .string()
    .trim()
    .min(1, "Le nom du contact ne peut pas être vide")
    .optional(),

  address: z
    .string()
    .trim()
    .min(1, "L'adresse ne peut pas être vide")
    .optional(),

  city: z.string().trim().min(1, "La ville ne peut pas être vide").optional(),

  postal_code: z
    .string()
    .trim()
    .min(1, "Le code postal ne peut pas être vide")
    .optional(),

  country: z.string().trim().min(1, "Le pays ne peut pas être vide").optional(),

  website: z.url("Format d'URL invalide").optional(),

  notes: z
    .string()
    .trim()
    .min(1, "Les notes ne peuvent pas être vides")
    .optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

/**
 * UPDATE SUPPLIER
 * - Tous les champs optionnels
 * - Si envoyés :
 *   - soit valeur valide
 *   - soit null (pour suppression)
 * - name reste validé s'il est modifié
 */
export const updateSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom du fournisseur doit contenir au moins 2 caractères")
    .optional(),

  email: z.union([z.email("Format d'email invalide"), z.null()]).optional(),

  phone: z
    .union([
      z.string().trim().min(1, "Le téléphone ne peut pas être vide"),
      z.null(),
    ])
    .optional(),

  contact_person: z
    .union([
      z.string().trim().min(1, "Le nom du contact ne peut pas être vide"),
      z.null(),
    ])
    .optional(),

  address: z
    .union([
      z.string().trim().min(1, "L'adresse ne peut pas être vide"),
      z.null(),
    ])
    .optional(),

  city: z
    .union([
      z.string().trim().min(1, "La ville ne peut pas être vide"),
      z.null(),
    ])
    .optional(),

  postal_code: z
    .union([
      z.string().trim().min(1, "Le code postal ne peut pas être vide"),
      z.null(),
    ])
    .optional(),

  country: z
    .union([
      z.string().trim().min(1, "Le pays ne peut pas être vide"),
      z.null(),
    ])
    .optional(),

  website: z.union([z.url("Format d'URL invalide"), z.null()]).optional(),

  notes: z
    .union([
      z.string().trim().min(1, "Les notes ne peuvent pas être vides"),
      z.null(),
    ])
    .optional(),

  is_active: z.boolean().optional(),
});

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

/**
 * SUPPLIER INTERFACE
 * Représente exactement une ligne en base de données
 */
export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
