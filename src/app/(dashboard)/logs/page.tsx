"use client";

import { useEffect, useState, useMemo } from "react";
import { Activity, Shield, Search, FilterX } from "lucide-react";
import { getAll, ActivityLog } from "@/services/activity_logs.service";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";

// ── Helpers visuels ──────────────────────────────────────────────

function getActionVariant(
  action: string,
): "success" | "warning" | "danger" | "blue" | "neutral" {
  switch (action) {
    case "CREATE":
      return "success";
    case "DELETE":
      return "danger";
    case "UPDATE":
      return "warning";
    case "VALIDATE":
      return "success";
    case "REJECT":
      return "danger";
    case "LOGIN":
      return "blue";
    case "LOGOUT":
      return "neutral";
    default:
      return "neutral";
  }
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    CREATE: "Création",
    UPDATE: "Modification",
    DELETE: "Suppression",
    VALIDATE: "Validation",
    REJECT: "Rejet",
    LOGIN: "Connexion",
    LOGOUT: "Déconnexion",
  };
  return labels[action] ?? action;
}

function getDetailsLabel(log: ActivityLog): string {
  const d = log.details as Record<string, unknown> | null;
  const name = d?.name ?? d?.email ?? d?.reference ?? null;

  switch (log.action) {
    case "CREATE":
      return name ? `Création : ${name}` : "Nouvel élément créé";
    case "UPDATE": {
      if (!d) return "Élément modifié";
      const keys = Object.keys(d).filter(
        (k) => !["id", "created_at", "updated_at"].includes(k),
      );
      return keys.length
        ? `Champs modifiés : ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? "..." : ""}`
        : "Élément modifié";
    }
    case "DELETE":
      return name ? `Supprimé : ${name}` : "Élément supprimé";
    case "VALIDATE":
      return d?.reference ? `Ref : ${d.reference}` : "Mouvement validé";
    case "REJECT":
      return d?.reference ? `Ref : ${d.reference}` : "Mouvement rejeté";
    case "LOGIN":
      return "Connexion réussie";
    case "LOGOUT":
      return "Déconnexion";
    default:
      return "—";
  }
}

function getEntityLabel(entity: string): string {
  const labels: Record<string, string> = {
    PRODUCT: "Produit",
    CATEGORY: "Catégorie",
    SUPPLIER: "Fournisseur",
    STOCK_MOVEMENT: "Mouvement",
    USER: "Utilisateur",
  };
  return labels[entity] ?? entity;
}

function getRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Composant principal ──────────────────────────────────────────

export default function LogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Redirection si pas admin
  useEffect(() => {
    if (!authLoading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAll();
        setLogs(data);
      } catch (err) {
        console.error("[Logs] Erreur fetch :", err);
        setError("Erreur lors du chargement des logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        log.user_name?.toLowerCase().includes(s) ||
        log.user_email?.toLowerCase().includes(s) ||
        log.entity_type?.toLowerCase().includes(s) ||
        log.action?.toLowerCase().includes(s);
      const matchAction = !actionFilter || log.action === actionFilter;
      const matchEntity = !entityFilter || log.entity_type === entityFilter;
      return matchSearch && matchAction && matchEntity;
    });
  }, [logs, search, actionFilter, entityFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const resetFilters = () => {
    setSearch("");
    setActionFilter("");
    setEntityFilter("");
    setCurrentPage(1);
  };

  if (authLoading || loading)
    return (
      <div className="p-8 text-center animate-pulse text-(--text-secondary)">
        Chargement...
      </div>
    );

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-400 mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Activity className="w-7 h-7 text-(--primary)" />
            Logs d&apos;activité
          </h1>
          <p className="text-(--text-secondary) mt-1">
            Historique complet de toutes les actions effectuées
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-(--primary)/10 border border-(--primary)/20 rounded-xl text-sm text-(--primary) font-medium">
          <Shield className="w-4 h-4" />
          Accès administrateur uniquement
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-(--text-secondary) font-medium uppercase">
            Total
          </p>
          <p className="text-xl font-bold mt-1">{logs.length}</p>
        </div>
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-green-500 font-medium uppercase">
            Créations
          </p>
          <p className="text-xl font-bold mt-1 text-green-500">
            {logs.filter((l) => l.action === "CREATE").length}
          </p>
        </div>
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-orange-500 font-medium uppercase">
            Modifications
          </p>
          <p className="text-xl font-bold mt-1 text-orange-500">
            {logs.filter((l) => l.action === "UPDATE").length}
          </p>
        </div>
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-red-500 font-medium uppercase">
            Suppressions
          </p>
          <p className="text-xl font-bold mt-1 text-red-500">
            {logs.filter((l) => l.action === "DELETE").length}
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-(--text-secondary)">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-secondary)" />
              <input
                type="text"
                placeholder="Utilisateur, entité..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-(--bg-dark) border border-(--border) rounded-lg text-sm text-(--text-primary) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-(--text-secondary)">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2.5 px-3 bg-(--bg-dark) border border-(--border) rounded-lg text-sm text-(--text-primary) focus:outline-none focus:border-(--primary) cursor-pointer"
            >
              <option value="">Toutes les actions</option>
              <option value="CREATE">Création</option>
              <option value="UPDATE">Modification</option>
              <option value="DELETE">Suppression</option>
              <option value="VALIDATE">Validation</option>
              <option value="REJECT">Rejet</option>
              <option value="LOGIN">Connexion</option>
              <option value="LOGOUT">Déconnexion</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-(--text-secondary)">
              Entité
            </label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2.5 px-3 bg-(--bg-dark) border border-(--border) rounded-lg text-sm text-(--text-primary) focus:outline-none focus:border-(--primary) cursor-pointer"
            >
              <option value="">Toutes les entités</option>
              <option value="PRODUCT">Produit</option>
              <option value="CATEGORY">Catégorie</option>
              <option value="SUPPLIER">Fournisseur</option>
              <option value="STOCK_MOVEMENT">Mouvement</option>
              <option value="USER">Utilisateur</option>
            </select>
          </div>
        </div>

        {(search || actionFilter || entityFilter) && (
          <button
            onClick={resetFilters}
            className="mt-4 text-sm text-(--primary) flex items-center gap-1 hover:underline cursor-pointer"
          >
            <FilterX size={14} /> Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-(--border)">
          <h3 className="text-lg font-bold">
            {filteredLogs.length} événement{filteredLogs.length > 1 ? "s" : ""}
          </h3>
        </div>

        {/* MOBILE — Cards */}
        <div className="md:hidden divide-y divide-(--border)">
          {paginatedLogs.map((log) => (
            <div key={log.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-(--primary)/20 flex items-center justify-center text-xs font-bold text-(--primary)">
                    {getInitials(log.user_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {log.user_name ?? "Système"}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {log.user_role}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-(--text-secondary)">
                  {getRelativeTime(log.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getActionVariant(log.action)}>
                  {getActionLabel(log.action)}
                </Badge>
                <span className="text-xs text-(--text-secondary)">
                  {getEntityLabel(log.entity_type)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP — Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/2 text-left border-b border-(--border)">
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider hidden lg:table-cell">
                  Détails
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/1 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-(--primary)/20 flex items-center justify-center text-xs font-bold text-(--primary) shrink-0">
                        {getInitials(log.user_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {log.user_name ?? "Système"}
                        </p>
                        <p className="text-xs text-(--text-secondary)">
                          {log.user_email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getActionVariant(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-(--text-secondary)">
                      {getEntityLabel(log.entity_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-(--text-secondary) truncate max-w-xs block">
                      {getDetailsLabel(log)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-(--text-secondary)">
                      {getRelativeTime(log.created_at)}
                    </span>
                    <p className="text-xs text-(--text-secondary)/50">
                      {new Date(log.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedLogs.length === 0 && (
          <div className="p-12 text-center text-(--text-secondary)">
            Aucun log trouvé
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-(--border) gap-4">
          <p className="text-sm text-(--text-secondary)">
            Affichage de{" "}
            <span className="font-medium text-(--text-primary)">
              {startIndex + 1}
            </span>{" "}
            à{" "}
            <span className="font-medium text-(--text-primary)">
              {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-(--text-primary)">
              {filteredLogs.length}
            </span>{" "}
            événements
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
