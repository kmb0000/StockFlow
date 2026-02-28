"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import SearchBar from "@/components/ui/search-input";
import Select from "@/components/ui/select";

import { StockMovementWithRelations } from "@/lib/stock_movements/stock_movements.types";
import { getAll, validate, reject } from "@/services/movements.service";
import { getMovementStatus, getMovementType } from "@/utils/movement-helpers";
import {
  ArrowDownToLine,
  Printer,
  PlusCircle,
  MinusCircle,
  History,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const userNames = [...new Set(movements.map((m) => m.created_by_name))];

  const filteredMovements = movements
    .filter((m) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        m.product_name.toLowerCase().includes(s) ||
        m.product_sku.toLowerCase().includes(s) ||
        m.reason.toLowerCase().includes(s)
      );
    })
    .filter((m) => !typeFilter || m.type === typeFilter)
    .filter((m) => !statusFilter || m.status === statusFilter)
    .filter((m) => !userFilter || m.created_by_name === userFilter);

  useEffect(() => {
    fetchMovements();
  }, []);

  async function fetchMovements() {
    try {
      const data = await getAll();
      setMovements(data);
    } catch (err) {
      setError("Erreur lors de la récupération des mouvements");
    } finally {
      setLoading(false);
    }
  }

  // Stats calculées
  const totalMovements = movements.length;
  const entriesCount = movements.filter((m) => m.type === "IN").length;
  const exitsCount = movements.filter((m) => m.type === "OUT").length;
  const pendingCount = movements.filter((m) => m.status === "PENDING").length;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovements = filteredMovements.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const handleAction = async (id: string, action: "validate" | "reject") => {
    try {
      if (action === "validate") await validate(id);
      else await reject(id);
      fetchMovements();
    } catch (err) {
      alert("L'action a échoué.");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse space-y-4">
        <div className="h-12 w-1/3 bg-(--border) rounded-xl mx-auto" />
        <div className="h-64 w-full bg-(--bg-card) rounded-2xl border border-(--border)" />
      </div>
    );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Flux de Stock</h1>
          <p className="text-(--text-secondary) flex items-center gap-2">
            <History className="w-4 h-4" /> Historique complet des entrées et
            sorties
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button className="flex-1 md:flex-none bg-(--success) hover:opacity-90 border-none text-white shadow-lg shadow-green-500/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Entrée
          </Button>
          <Button className="flex-1 md:flex-none bg-(--error) hover:opacity-90 border-none text-white shadow-lg shadow-red-500/20">
            <MinusCircle className="w-4 h-4 mr-2" /> Sortie
          </Button>
        </div>
      </header>

      {/* FILTERS */}
      <div className="bg-(--bg-card) border border-(--border) p-5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <SearchBar
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous les types</option>
            <option value="IN">Entrées (+)</option>
            <option value="OUT">Sorties (-)</option>
          </Select>
          <Select
            label="Statut"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="VALIDATED">Validés</option>
            <option value="REJECTED">Rejetés</option>
          </Select>
          <Select
            label="Auteur"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous les utilisateurs</option>
            {userNames.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setTypeFilter("");
              setStatusFilter("");
              setUserFilter("");
            }}
            className="w-full"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            val: totalMovements,
            color: "text-(--text-primary)",
          },
          { label: "Entrées", val: entriesCount, color: "text-(--success)" },
          { label: "Sorties", val: exitsCount, color: "text-(--error)" },
          { label: "En attente", val: pendingCount, color: "text-(--warning)" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center"
          >
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-1">
              {s.label}
            </p>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-(--border) flex justify-between items-center bg-(--bg-card)">
          <h2 className="text-lg font-bold">Mouvements récents</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-(--border) rounded-lg hover:text-(--primary) hover:border-(--primary) transition-all">
              <ArrowDownToLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 border border-(--border) rounded-lg hover:text-(--primary) hover:border-(--primary) transition-all"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-250">
            <thead>
              <tr className="bg-(--bg-body)/50 text-(--text-secondary) text-xs uppercase tracking-tighter">
                <th className="px-6 py-4 font-bold">Produit</th>
                <th className="px-6 py-4 font-bold">Flux</th>
                <th className="px-6 py-4 font-bold">Raison / Réf</th>
                <th className="px-6 py-4 font-bold">Auteur / Date</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {paginatedMovements.map((m) => {
                const accent = m.product_category_color ?? "#0066FF";
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-(--primary-alpha)/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center rounded-lg text-xl"
                          style={{
                            backgroundColor: `${accent}15`,
                            border: `1px solid ${accent}30`,
                          }}
                        >
                          {m.product_category_icon || "📦"}
                        </div>
                        <div>
                          <p className="font-bold leading-none mb-1 group-hover:text-(--primary) transition-colors">
                            {m.product_name}
                          </p>
                          <p className="text-[10px] font-mono opacity-50 uppercase">
                            {m.product_sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant={getMovementType(m.type).variant}>
                          {getMovementType(m.type).label}
                        </Badge>
                        <span
                          className={`text-sm font-black ${m.type === "IN" ? "text-(--success)" : "text-(--error)"}`}
                        >
                          {m.type === "IN" ? "+" : "-"}
                          {m.quantity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{m.reason}</p>
                      <p className="text-[10px] opacity-40 font-mono">
                        #{m.reference || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-(--border) flex items-center justify-center">
                          <User className="w-3 h-3" />
                        </div>
                        <span>{m.created_by_name}</span>
                      </div>
                      <p className="text-[10px] opacity-50 mt-1">
                        {new Date(m.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getMovementStatus(m.status).variant}>
                        {getMovementStatus(m.status).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {m.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(m.id, "validate")}
                            className="p-2 rounded-lg bg-(--success)/10 text-(--success) hover:bg-(--success) hover:text-white transition-all shadow-sm"
                            title="Valider"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(m.id, "reject")}
                            className="p-2 rounded-lg bg-(--error)/10 text-(--error) hover:bg-(--error) hover:text-white transition-all shadow-sm"
                            title="Rejeter"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs italic opacity-30">
                          Traitée
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-6 border-t border-(--border) flex flex-col sm:row justify-between items-center gap-4 bg-(--bg-card)">
          <p className="text-xs text-(--text-secondary)">
            Affichage de{" "}
            <span className="font-bold text-(--text-primary)">
              {startIndex + 1}
            </span>{" "}
            à{" "}
            <span className="font-bold text-(--text-primary)">
              {Math.min(startIndex + itemsPerPage, filteredMovements.length)}
            </span>{" "}
            sur {filteredMovements.length}
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
