"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import SearchBar from "@/components/ui/search-input";
import Select from "@/components/ui/select";
import Pagination from "@/components/ui/pagination";

import { Supplier } from "@/lib/suppliers/suppliers.type";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getAll } from "@/services/suppliers.service";
import { getAll as getAllProducts } from "@/services/products.service";

import {
  ArrowDownToLine,
  CircleFadingPlus,
  Mail,
  MapPin,
  Phone,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Suppliers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData] = await Promise.all([
          getAll(),
          getAllProducts(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
      } catch (err) {
        console.error(
          `[Suppliers] Erreur fetch getAll[suppliers] ou getAllProducts :`,
          err,
        );
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculs stats
  const activeSuppliers = suppliers.filter((s) => s.is_active).length;
  const suppliersWithProducts = products.filter((p) => p.supplier_id).length;

  // Filtrage
  const filteredSuppliers = suppliers
    .filter((supplier) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        supplier.name.toLowerCase().includes(s) ||
        supplier.email?.toLowerCase().includes(s) ||
        supplier.city?.toLowerCase().includes(s)
      );
    })
    .filter((supplier) => {
      if (!statusFilter) return true;
      return supplier.is_active === (statusFilter === "true");
    });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-(--error) bg-(--error-alpha)/10 rounded-xl m-4">
        {error}
      </div>
    );

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-400 mx-auto">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Fournisseurs</h1>
          <p className="text-(--text-secondary)">
            Gestion du catalogue et des contacts partenaires
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button className="bg-(--primary) hover:opacity-90">
            <CircleFadingPlus className="w-4 h-4 mr-2" /> Ajouter un fournisseur
          </Button>
        </Link>
      </header>

      {/* FILTERS */}
      <div className="bg-(--bg-card) border border-(--border) p-4 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] gap-4 items-end">
          <SearchBar
            placeholder="Rechercher par nom, email ou ville..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            label="Statut"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </Select>
          <Button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            variant="secondary"
            className="hover:text-(--primary)"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total fournisseurs",
            value: suppliers.length,
            color: "text-(--text-primary)",
          },
          {
            label: "Fournisseurs actifs",
            value: activeSuppliers,
            color: "text-(--success)",
          },
          {
            label: "Produits rattachés",
            value: suppliersWithProducts,
            color: "text-(--primary)",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl text-center shadow-sm hover:border-(--primary-alpha) transition-colors"
          >
            <span className="text-(--text-secondary) text-xs uppercase tracking-widest font-bold">
              {stat.label}
            </span>
            <p className={`text-4xl font-black mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE LIST */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-(--border)">
          <h2 className="text-xl font-bold">Annuaire Partenaires</h2>
          <button
            title="Exporter CSV"
            className="p-2 border border-(--border) rounded-lg hover:text-(--primary) hover:border-(--primary) transition-all"
          >
            <ArrowDownToLine className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-(--bg-body)/50 text-(--text-secondary) text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Fournisseur / Email</th>
                <th className="px-6 py-4 font-bold">Contact Principal</th>
                <th className="px-6 py-4 font-bold">Localisation</th>
                <th className="px-6 py-4 font-bold text-center">Produits</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {paginatedSuppliers.map((supplier) => {
                const supplierProductsCount = products.filter(
                  (p) => p.supplier_id === supplier.id,
                ).length;
                const initials = supplier.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr
                    key={supplier.id}
                    className="hover:bg-(--primary-alpha)/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-linear-to-br from-(--primary) to-(--primary-alpha) flex items-center justify-center text-xs font-black text-white shadow-md">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold group-hover:text-(--primary) transition-colors">
                            {supplier.name}
                          </span>
                          <span className="text-xs text-(--text-secondary) flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {supplier.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium flex items-center gap-1">
                          <User2 className="w-3 h-3 opacity-50" />{" "}
                          {supplier.contact_person}
                        </span>
                        <span className="text-xs text-(--text-secondary) flex items-center gap-1">
                          <Phone className="w-3 h-3 opacity-50" />{" "}
                          {supplier.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-(--primary)" />{" "}
                          {supplier.city}
                        </span>
                        <span className="text-[10px] text-(--text-secondary) uppercase truncate max-w-37.5">
                          {supplier.address}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-(--bg-body) border border-(--border) text-sm font-bold">
                        {supplierProductsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={supplier.is_active ? "success" : "danger"}
                      >
                        {supplier.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/suppliers/${supplier.id}`}>
                          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-(--border) hover:border-(--primary) hover:text-(--primary) transition-all cursor-pointer bg-(--bg-card)">
                            Détails
                          </button>
                        </Link>
                        <Link href={`/suppliers/${supplier.id}/edit`}>
                          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--primary-alpha)/10 text-(--primary) hover:bg-(--primary) hover:text-white transition-all cursor-pointer">
                            Editer
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <footer className="flex flex-col sm:row justify-between items-center p-6 border-t border-(--border) gap-4 bg-(--bg-card)">
          <div className="text-xs font-medium text-(--text-secondary)">
            Affichage de{" "}
            <span className="text-(--text-primary)">{startIndex + 1}</span> à{" "}
            <span className="text-(--text-primary)">
              {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)}
            </span>{" "}
            sur {filteredSuppliers.length} fournisseurs
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </footer>
      </div>
    </div>
  );
}
