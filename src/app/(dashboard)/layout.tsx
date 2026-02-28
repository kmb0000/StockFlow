"use client";

import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State pour ouvrir/fermer la sidebar sur mobile uniquement
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return <p>Chargement...</p>;

  return (
    <div className="flex h-screen bg-(--bg-dark)">
      {/* SIDEBAR : Elle gère son propre affichage responsive (Fixed mobile / Static desktop) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER MOBILE (Visible uniquement sur mobile) */}
        <header className="md:hidden flex items-center p-4 border-b border-(--border) bg-(--bg-card)">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 mr-2 text-(--text-primary) hover:bg-white/5 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg">StockFlow</span>
        </header>

        {/* ZONE DE CONTENU */}
        {/* p-4 sur mobile pour gagner de la place, p-8 sur desktop*/}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
