"use client";

import { UserSafe } from "@/lib/users/users.types";
import {
  getMe,
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";
import { update } from "@/services/users.service";
import { createContext, useEffect, useState } from "react";

type AuthContextType = {
  user: UserSafe | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateCurrentUser: async () => {},
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

  async function handleLogin(email: string, password: string) {
    const data = await loginService(email, password);
    setUser(data);
  }

  async function handleLogout() {
    await logoutService();
    setUser(null);
  }

  async function handleUpdateCurrentUser(data: {
    name?: string;
    email?: string;
    password?: string;
  }) {
    if (!user) return;
    const updated = await update(user.id, data);
    // Met à jour le context — la sidebar et partout ailleurs se re-rendent
    setUser({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatar_url: updated.avatar_url,
      is_active: updated.is_active,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        updateCurrentUser: handleUpdateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
