import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().trim().max(1000).optional(),
  quantity: z.coerce.number().int().min(0),
  selling_price: z.coerce.number().min(0),
  purchase_price: z.coerce.number().min(0),
  category_id: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  unit: z.string().optional(),
  weight: z.coerce.number().optional().nullable(),
  alert_threshold: z.coerce.number().int().min(0).optional().nullable(),
  location: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  is_available: z.boolean().optional(),
});
//Génère automatiquement le type TS basé sur le schema
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Le client ne fournit pas le sku
// Le service génère le sku
//le repository doit recevoir des données complètes
export interface CreateProductData extends CreateProductInput {
  sku: string;
}
// Un PATCH est un update partiel
// Si un champ est présent → il doit respecter les règles
// S’il est absent → on ne le touche pas
export const updateProductSchema = createProductSchema.partial();
// type TS cohérent avec le PATCH
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Ce type représente une ligne complète retournée par la base de données
/*
    Ce n’est PAS un input.
    Ce n’est PAS ce que le client envoie.
    C’est ce que PostgreSQL retourne
  */
export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;

  category_id: string | null;
  supplier_id: string | null;
  created_by: string | null;

  purchase_price: string;
  selling_price: string;
  tax_rate: string;

  quantity: number;
  unit: string;
  alert_threshold: number | null;
  min_quantity: number | null;
  max_quantity: number | null;

  weight: string | null;
  dimensions: string | null;

  location: string | null;
  tags: string[] | null;
  images: string[] | null;

  status: "active" | "draft" | "archived";
  is_available: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface ProductWithRelations {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  quantity: number;
  selling_price: string;
  purchase_price: string;
  status: string;
  created_at: Date;

  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;

  supplier_id: string | null;
  supplier_name: string | null;

  created_by_id: string | null;
  created_by_name: string | null;
  created_by_role: string | null;
}

export interface ProductDetail extends ProductWithRelations {
  barcode: string | null;
  tax_rate: string;
  unit: string;
  alert_threshold: number | null;
  weight: string | null;
  location: string | null;
  tags: string[] | null;
  images: string[] | null;
  is_available: boolean;
  supplier_email: string | null;
  supplier_phone: string | null;
  supplier_contact: string | null;
}
