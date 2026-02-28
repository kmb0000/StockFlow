import { User } from "@/lib/users/users.types";
import { request } from "./client";

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  avatar_url?: string | null;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  avatar_url?: string | null;
  is_active?: boolean;
}

export type UserSafe = Omit<User, "password_hash">;

export async function getAll(): Promise<UserSafe[]> {
  return request<UserSafe[]>("/api/users", {
    method: "GET",
  });
}

export async function getById(id: string): Promise<UserSafe> {
  return request<UserSafe>(`/api/users/${id}`, {
    method: "GET",
  });
}

export async function create(data: CreateUserPayload): Promise<UserSafe> {
  return request<UserSafe>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function update(
  id: string,
  data: UpdateUserPayload,
): Promise<UserSafe> {
  return request<UserSafe>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<void> {
  return request<void>(`/api/users/${id}`, {
    method: "DELETE",
  });
}
