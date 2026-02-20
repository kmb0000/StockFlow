import {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from "@/lib/suppliers/suppliers.type";
import { request } from "./client";

export async function getAll(): Promise<Supplier[]> {
  return request<Supplier[]>("/api/suppliers", {
    method: "GET",
  });
}

export async function getById(id: string): Promise<Supplier> {
  return request<Supplier>(`/api/suppliers/${id}`, {
    method: "GET",
  });
}

export async function create(data: CreateSupplierInput): Promise<Supplier> {
  return request<Supplier>("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function update(
  data: UpdateSupplierInput,
  id: string,
): Promise<Supplier> {
  return request<Supplier>(`/api/suppliers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSupplier(id: string): Promise<void> {
  return request<void>(`/api/suppliers/${id}`, {
    method: "DELETE",
  });
}
