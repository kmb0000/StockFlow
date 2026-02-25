import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/categories/categories.types";
import { request } from "./client";

export async function getAll(): Promise<Category[]> {
  return request<Category[]>("/api/categories", {
    method: "GET",
  });
}

export async function getById(id: string): Promise<Category> {
  return request<Category>(`/api/categories/${id}`, {
    method: "GET",
  });
}

export async function create(data: CreateCategoryInput): Promise<Category> {
  return request<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function update(
  data: UpdateCategoryInput,
  id: string,
): Promise<Category> {
  return request<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCategorie(id: string): Promise<void> {
  return request<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}
