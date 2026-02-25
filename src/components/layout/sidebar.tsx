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
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Sidebar() {
  const { user, loading, logout } = useAuth();
  return (
    <aside className="w-64 h-full flex flex-col bg-(--bg-card) border-r border-(--border)">
      {/* TOP — LOGO */}
      <div className="px-6 py-7 border-b border-(--border)">
        <Link href="/">
          <h1 className="text-2xl font-black text-(--primary)">StockFlow</h1>
        </Link>
      </div>

      {/* MIDDLE — NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
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
            />
          </div>
        </div>

        {/* INVENTAIRE */}
        <div>
          <p className="px-2 mb-2 text-xs font-semibold tracking-widest text-(--text-secondary)">
            INVENTAIRE
          </p>
          <div className="space-y-1">
            <SidebarItem href="/products" label="Produits" Icon={Package} />

            <SidebarItem
              href="/categories"
              label="Catégories"
              Icon={FolderOpen}
            />

            <SidebarItem href="/suppliers" label="Fournisseurs" Icon={Truck} />

            <SidebarItem
              href="/movements"
              label="Mouvements"
              Icon={ArrowLeftRight}
            />
          </div>
        </div>

        {/* ADMINISTRATION */}
        <div>
          <p className="px-2 mb-2 text-xs font-semibold tracking-widest text-(--text-secondary)">
            ADMINISTRATION
          </p>
          <div className="space-y-1">
            <SidebarItem href="/users" label="Utilisateurs" Icon={Users} />

            <SidebarItem href="/settings" label="Paramètres" Icon={Settings} />
          </div>
        </div>
      </nav>

      {/* BOTTOM — USER */}
      <div className="px-2 py-4 border-t border-(--border)">
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
          <div>
            <button
              className="cursor-pointer hover:animate-pulse"
              title="déconnexion"
              onClick={() => {
                if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                  logout();
                }
              }}
            >
              <LogOut color="red" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
