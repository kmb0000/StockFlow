"use client";

import Link from "next/link";
import SidebarItem from "./sidebar-nav-item";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Truck,
  ArrowLeftRight,
  Users,
  Activity,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* OVERLAY (FOND NOIR) - Visible uniquement sur mobile quand ouvert */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* ASIDE - Structure Flexbox conservée intacte */}
      <aside
        className={cn(
          // 1. DIMENSIONS ET POSITION DE BASE
          "fixed inset-y-0 left-0 z-50 w-64 bg-(--bg-card) border-r border-(--border)",
          // 2. FLEXBOX (CRUCIAL : C'est ça qui garde le profil en bas)
          "flex flex-col h-full",
          // 3. TRANSITION MOBILE (Slide in/out)
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // 4. COMPORTEMENT DESKTOP (Reset total pour revenir à ta version originale)
          "md:static md:translate-x-0",
        )}
      >
        {/* TOP — LOGO */}
        {/* J'ai juste ajouté justify-between pour caler la croix à droite sur mobile */}
        <div className="px-6 py-7 border-b border-(--border) flex items-center justify-between shrink-0">
          <Link href="/" onClick={onClose}>
            <h1 className="text-2xl font-black text-(--primary)">StockFlow</h1>
          </Link>
          {/* La croix ne s'affiche que sur mobile (md:hidden) */}
          <button
            onClick={onClose}
            className="md:hidden text-(--text-secondary)"
          >
            <X size={24} />
          </button>
        </div>

        {/* MIDDLE — NAVIGATION */}
        {/* flex-1 est CRUCIAL ici : il pousse le footer vers le bas */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* ... TON CODE EXACT DE NAVIGATION ... */}

          {/* PRINCIPAL */}
          <div>
            <p className="px-2 mb-2 text-xs font-semibold tracking-widest text-(--text-secondary)">
              PRINCIPAL
            </p>
            <div className="space-y-1">
              <SidebarItem
                href="/dashboard"
                label="Tableau de bord"
                Icon={LayoutDashboard}
                onClick={onClose}
              />
            </div>
          </div>

          {/* INVENTAIRE */}
          <div>
            <p className="px-2 mb-2 text-xs font-semibold tracking-widest text-(--text-secondary)">
              INVENTAIRE
            </p>
            <div className="space-y-1">
              <SidebarItem
                href="/products"
                label="Produits"
                Icon={Package}
                onClick={onClose}
              />
              <SidebarItem
                href="/categories"
                label="Catégories"
                Icon={FolderOpen}
                onClick={onClose}
              />
              <SidebarItem
                href="/suppliers"
                label="Fournisseurs"
                Icon={Truck}
                onClick={onClose}
              />
              <SidebarItem
                href="/movements"
                label="Mouvements"
                Icon={ArrowLeftRight}
                onClick={onClose}
              />
            </div>
          </div>

          {/* ADMINISTRATION */}
          <div>
            <p className="px-2 mb-2 text-xs font-semibold tracking-widest text-(--text-secondary)">
              ADMINISTRATION
            </p>
            <div className="space-y-1">
              <SidebarItem
                href="/users"
                label="Utilisateurs"
                Icon={Users}
                onClick={onClose}
              />
              <SidebarItem
                href="/logs"
                label="Logs d'activité"
                Icon={Activity}
                onClick={onClose}
              />
              <SidebarItem
                href="/settings"
                label="Paramètres"
                Icon={Settings}
                onClick={onClose}
              />
            </div>
          </div>
        </nav>

        {/* BOTTOM — USER */}
        {/* shrink-0 empêche cette section d'être écrasée si l'écran est petit */}
        <div className="px-2 py-4 border-t border-(--border) shrink-0">
          <div className="flex items-center justify-around gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-(--primary) flex items-center justify-center text-sm font-bold text-white">
              {user
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>

            {/* User info */}
            {user && (
              <div className="leading-tight">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-xs text-(--text-secondary)">
                  {user?.role}
                </div>
              </div>
            )}

            {/* Logout */}
            <div>
              <button
                className="cursor-pointer hover:animate-pulse"
                title="déconnexion"
                onClick={() => {
                  if (
                    window.confirm("Voulez-vous vraiment vous déconnecter ?")
                  ) {
                    logout();
                  }
                }}
              >
                <LogOut color="red" size={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
