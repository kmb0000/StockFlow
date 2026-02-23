"use client";

import { UserSafe } from "@/lib/users/users.types";
import { getMe } from "@/services/auth.service";
import { createContext, useEffect, useState } from "react";

//Type de ce que le context contient

type AuthContextType = {
  user: UserSafe | null;
  loading: boolean;
};

//Création du context en dehors du composant

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
