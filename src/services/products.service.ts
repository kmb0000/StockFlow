import {
  CreateProductInput,
  Product,
  ProductWithRelations,
  UpdateProductInput,
} from "@/lib/products/products.types";
import { request } from "./client";

export async function getAll(): Promise<ProductWithRelations[]> {
  return request<ProductWithRelations[]>("/api/products", {
    method: "GET",
  });
}

export async function getById(id: string): Promise<ProductWithRelations> {
  return request<ProductWithRelations>(`/api/products/${id}`, {
    method: "GET",
  });
}

export async function create(data: CreateProductInput): Promise<Product> {
  return request<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function update(
  id: string,
  data: UpdateProductInput,
): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return request<void>(`/api/products/${id}`, {
    method: "DELETE",
  });
}
