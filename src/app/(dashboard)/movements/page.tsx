"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import SearchBar from "@/components/ui/search-input";
import Select from "@/components/ui/select";

import { StockMovementWithRelations } from "@/lib/stock_movements/stock_movements.types";
import { getAll } from "@/services/movements.service";
import { getMovementStatus, getMovementType } from "@/utils/movement-helpers";
import { ArrowDownToLine, Inbox, Printer } from "lucide-react";
import { useEffect, useState } from "react";

export default function StockMovements() {
  //states globals
  const [movements, setMovements] = useState<StockMovementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = await getAll();
        setMovements(data);
      } catch {
        setError("Erreur lors de la récupération des mouvements");
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);

  //variables des stats
  const totalMovements = movements.length;
  const entriesThisMonth = movements.filter((m) => m.type === "IN").length;
  const exitsThisMonth = movements.filter((m) => m.type === "OUT").length;
  const pending = movements.filter((m) => m.status === "PENDING").length;

  //states pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovements = movements.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(totalMovements / itemsPerPage);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-(--error)">{error}</p>;
  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
      <header className="flex justify-between items-center p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black">Mouvements de stock</h1>
          <p className="text-sm text-(--text-secondary)">
            Historique et gestion des entrées/sorties de stock
          </p>
        </div>
        <div className="flex gap-5">
          <Button
            className="px-6 py-3 rounded-xl font-semibold 
            bg-linear-to-r from-green-500 to-green-900 
            hover:from-green-900 hover:to-green-500 
            transition-all duration-500 
            shadow-lg hover:shadow-2xl 
            hover:scale-105"
          >
            <Inbox color="green" /> Entrée de stock
          </Button>
          <Button
            className="px-6 py-3 rounded-xl font-semibold 
            bg-linear-to-r from-red-500 to-red-900 
            hover:from-red-900 hover:to-red-500 
            transition-all duration-500 
            shadow-lg hover:shadow-2xl 
            hover:scale-105"
          >
            <Inbox color="red" /> Sortie de stock
          </Button>
        </div>
      </header>

      <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-end">
          <SearchBar placeholder="Produit, référence, raison..." />
          <Select label={"Type"}></Select>
          <Select label={"Période"}></Select>
          <Select label={"Utilisateur"}></Select>
          {/* Button reset */}
          <Button
            className="hover:border-(--primary) hover:text-(--primary)"
            variant="secondary"
          >
            Rénitialiser
          </Button>
        </div>
      </div>

      {/* SECTIONS STATS */}
      <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
        <div className="flex justify-around items-center text-center">
          <div className="flex flex-col p-4 gap-3">
            <span className="text-(--text-secondary) text-sm">
              Total mouvements
            </span>
            <span className="text-3xl">{totalMovements}</span>
          </div>
          <div className="flex flex-col p-4 gap-3">
            <span className="text-(--text-secondary) text-sm">
              Entrées ce mois
            </span>
            <span className="text-3xl text-(--success)">
              {entriesThisMonth}
            </span>
          </div>
          <div className="flex flex-col p-4 gap-3">
            <span className="text-(--text-secondary) text-sm">
              Sorties ce mois
            </span>
            <span className="text-3xl text-(--error)">{exitsThisMonth}</span>
          </div>
          <div className="flex flex-col p-4 gap-3">
            <span className="text-(--text-secondary) text-sm">En attente</span>
            <span className="text-3xl text-(--warning)">{pending}</span>
          </div>
        </div>
      </div>

      {/* SECTION HEADER LIST */}

      <div className="bg-(--bg-card) border border-(--border) rounded-xl">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-bold">Historique des mouvements</h2>
          <div className="flex gap-2">
            <button
              title="Exporter"
              className="rounded-lg border border-(--border) hover:border-(--primary) transition-all duration-200 opacity-70 hover:opacity-100 p-3 hover:text-(--primary) cursor-pointer"
            >
              <ArrowDownToLine className="w-5 h-5" />
            </button>
            <button
              title="Imprimer"
              onClick={() => window.print()}
              className="rounded-lg border border-(--border) hover:border-(--primary) transition-all duration-200 opacity-70 hover:opacity-100 p-3 hover:text-(--primary) cursor-pointer"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION LIST BODY */}
        <table className="w-full border-collapse text-left">
          <thead className="bg-[rgba(255,255,255,0.02)] border border-(--border)">
            <tr className="text-(--text-secondary) text-sm">
              <th className="px-6 py-4 w-[22%]">Produit</th>
              <th className="px-6 py-4 w-[10%]">Type</th>
              <th className="px-6 py-4 w-[8%]">Quantité</th>
              <th className="px-6 py-4 w-[20%]">Raison</th>
              <th className="px-6 py-4 w-[15%]">Créé par</th>
              <th className="px-6 py-4 w-[10%]">Validation</th>
              <th className="px-6 py-4 w-[15%]">Référence</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMovements.map((movement) => {
              const color = movement.product_category_color ?? "#0066FF";
              return (
                <tr
                  key={movement.id}
                  className="border-b border-(--border) hover:bg-(--border)"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="text-2xl rounded-lg"
                        style={{
                          backgroundColor: `${color}20`,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {movement.product_category_icon ?? "📦"}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-lg font-bold">
                          {movement.product_name}
                        </div>
                        <div className="text-(--text-secondary) text-xs">
                          {movement.product_sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getMovementType(movement.type).variant}>
                      {getMovementType(movement.type).label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        movement.type === "IN"
                          ? "text-(--success) font-black"
                          : "text-(--error) font-black"
                      }
                    >
                      {movement.type === "IN" ? "+" : "-"}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{movement.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm">{movement.created_by_name}</div>
                      <div className="text-xs text-(--text-secondary)">
                        {new Date(movement.created_at).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getMovementStatus(movement.status).variant}>
                      {getMovementStatus(movement.status).label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-(--text-secondary)">
                      {movement.reference}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* FOOTER PAGINATION */}
        <div className="flex justify-between items-center p-6 border-t border-(--border)">
          <div className="text-sm opacity-60">
            Affichage de {startIndex + 1} à{" "}
            {Math.min(startIndex + itemsPerPage, totalMovements)} sur{" "}
            {totalMovements} mouvements
          </div>
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
