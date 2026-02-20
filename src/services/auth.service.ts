import { request } from "./client";
import { UserSafe } from "@/lib/users/users.types";

export async function login(
  email: string,
  password: string,
): Promise<UserSafe> {
  return request<UserSafe>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export async function getMe(): Promise<UserSafe> {
  return request<UserSafe>("/api/auth/me", {
    method: "GET",
  });
}
