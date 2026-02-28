export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  avatar_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
export interface UserSafe {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  avatar_url: string | null;
  is_active: boolean;
}

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface CreateUserInput {
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  avatar_url?: string | null;
  is_active?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password_hash?: string; // Toujours hashé avant d'arriver ici
  password?: string; // Champ intermédiaire, retiré avant l'update SQL
  role?: UserRole;
  avatar_url?: string | null;
  is_active?: boolean;
}
