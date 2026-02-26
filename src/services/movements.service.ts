import {
  CreateStockMovementInput,
  StockMovement,
  StockMovementWithRelations,
} from "@/lib/stock_movements/stock_movements.types";
import { request } from "./client";

export async function getAll(): Promise<StockMovementWithRelations[]> {
  return request<StockMovementWithRelations[]>("/api/stock_movements", {
    method: "GET",
  });
}

export async function getById(id: string): Promise<StockMovement> {
  return request<StockMovement>(`/api/stock_movements/${id}`, {
    method: "GET",
  });
}

export async function create(
  data: CreateStockMovementInput,
): Promise<StockMovement> {
  return request<StockMovement>("/api/stock_movements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function validate(id: string): Promise<StockMovement> {
  return request<StockMovement>(`/api/stock_movements/${id}/validate`, {
    method: "POST",
  });
}

export async function reject(id: string): Promise<StockMovement> {
  return request<StockMovement>(`/api/stock_movements/${id}/reject`, {
    method: "POST",
  });
}
