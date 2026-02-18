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
