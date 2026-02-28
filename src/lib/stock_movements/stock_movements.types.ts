import { z } from "zod";

export type MovementType = "IN" | "OUT";
export type MovementStatus = "PENDING" | "VALIDATED" | "REJECTED";

export interface StockMovement {
  id: string;
  product_id: string;
  created_by: string;
  type: MovementType;
  quantity: number;
  reason: string;
  notes: string | null;
  reference: string | null;
  unit_price: number | null;
  validated_by: string | null;
  validated_at: Date | null;
  status: MovementStatus;
  created_at: Date;
}

export interface InsertStockMovementData {
  product_id: string;
  created_by: string;
  type: MovementType;
  quantity: number;
  reason: string;
  notes: string | null;
  reference: string | null;
  unit_price: number | null;
  status: MovementStatus;
}

export interface StockMovementWithRelations extends StockMovement {
  product_name: string;
  product_sku: string;
  product_category_icon: string | null;
  created_by_name: string;
  product_category_color: string | null;
}

export const createStockMovementSchema = z.object({
  product_id: z.uuid(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive(),
  reason: z.string().min(3, "Doit contenir au minimum 3 caractères"),
  notes: z.string().optional(),
  reference: z.string().optional(),
  unit_price: z.number().positive().optional(),
});
export type CreateStockMovementInput = z.infer<
  typeof createStockMovementSchema
>;
