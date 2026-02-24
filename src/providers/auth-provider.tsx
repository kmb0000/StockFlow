"use client";

import { UserSafe } from "@/lib/users/users.types";
import {
  getMe,
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";
import { createContext, useEffect, useState } from "react";

//Type de ce que le context contient

type AuthContextType = {
  user: UserSafe | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

//Création du context en dehors du composant

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserSafe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  //function Login
  async function handleLogin(email: string, password: string) {
    const data = await loginService(email, password);
    setUser(data);
  }

  async function handleLogout() {
    await logoutService();
    setUser(null);
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
