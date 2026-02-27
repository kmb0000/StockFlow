"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import SearchBar from "@/components/ui/search-input";
import Select from "@/components/ui/select";
import { Supplier } from "@/lib/suppliers/suppliers.type";
import { getAll } from "@/services/suppliers.service";
import { getAll as getAllProducts } from "@/services/products.service";
import { ArrowDownToLine, CircleFadingPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductWithRelations } from "@/lib/products/products.types";
import Pagination from "@/components/ui/pagination";

export default function Suppliers() {
  //states globals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);

  //states input
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  //fetch des fournisseurs
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAll();
        setSuppliers(data);
      } catch {
        setError("Erreur lors de la récupération des fournisseurs");
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  //fetch des produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch {
        setError("Erreur lors de la récupération des produits");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const activeSuppliers = suppliers.filter((s) => s.is_active).length;

  const suppliersProduct = products.filter((p) => p.supplier_id).length;

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

  const totalSuppliers = suppliers.length;
  //states pagination
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  //pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-(--error)">{error}</p>;

  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="p-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Fournisseurs</h1>
          <p className="text-(--text-secondary)">
            Gérez vos fournisseurs et leurs coordonnées
          </p>
        </div>
        {/* Bouton ADD */}
        <div>
          <Link href="/suppliers/new">
            <Button>
              <CircleFadingPlus className="w-5 h-5" /> Ajouter un fournisseur
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] gap-4 items-end">
          <SearchBar
            placeholder="Nom, email, ville..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            label={"Statut"}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </Select>
          {/* Button reset */}
          <Button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="hover:border-(--primary) hover:text-(--primary)"
            variant="secondary"
          >
            Rénitialiser
          </Button>
        </div>
      </div>

      {/* SECTION STATS */}
      <div className="bg-(--bg-card) border border-(--border) p-6 rounded-xl flex justify-around text-center gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-(--text-secondary) text-sm">
            Total fournisseur
          </span>
          <span className=" text-3xl font-black">{suppliers.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-(--text-secondary) text-sm">Actifs</span>
          <span className="text-(--success) text-3xl font-black">
            {activeSuppliers}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-(--text-secondary) text-sm">
            Produits fournis
          </span>
          <span className="text-(--primary) text-3xl font-black">
            {suppliersProduct}
          </span>
        </div>
      </div>

      {/* SECTION LIST */}
      <div className="bg-(--bg-card) border border-(--border) rounded-xl">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-lg font-bold">Liste des fournisseurs</h2>
          <button
            title="Exporter"
            className="rounded-lg border border-(--border) hover:border-(--primary) transition-all duration-200 opacity-70 hover:opacity-100 p-2 hover:text-(--primary)"
          >
            <ArrowDownToLine className="w-5 h-5" />
          </button>
        </div>

        <table className="w-full border-collapse text-left">
          <thead className="bg-[rgba(255,255,255,0.02)] border border-(--border)">
            <tr>
              <th className="px-6 py-4 w-[25%]">Fournisseur</th>
              <th className="px-6 py-4 w-[20%]">Contact</th>
              <th className="px-6 py-4 w-[20%]">Localisation</th>
              <th className="px-6 py-4 w-[15%]">Produits</th>
              <th className="px-6 py-4 w-[10%]">Statut</th>
              <th className="px-6 py-4 w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSuppliers.map((supplier) => {
              const productsPerSupplier = products.filter(
                (p) => p.supplier_id === supplier.id,
              );
              return (
                <tr
                  key={supplier.id}
                  className="border-b border-(--border) hover:bg-(--border)"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-(--primary) flex items-center justify-center text-sm font-bold text-white">
                        {supplier.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="flex flex-col">
                        <span>{supplier.name}</span>
                        <span className="text-sm text-(--text-secondary)">
                          {supplier.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{supplier.contact_person}</span>
                      <span className="text-sm text-(--text-secondary)">
                        {supplier.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{supplier.city}</span>
                      <span className="text-sm text-(--text-secondary)">
                        {supplier.address}, {supplier.postal_code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold">
                      {productsPerSupplier.length}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <Badge
                        variant={supplier.is_active ? "success" : "danger"}
                      >
                        {supplier.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-md border border-(--border) hover:border-(--primary) hover:text-(--primary) transition-all duration-200 px-2 py-1">
                        <Link href={`/suppliers/${supplier.id}`}>
                          <button className="cursor-pointer text-(--text-secondary) hover:text-(--primary)">
                            Voir
                          </button>
                        </Link>
                      </div>
                      <Link href={`/suppliers/${supplier.id}/edit`}>
                        <div className="rounded-md border border-(--border) hover:border-(--primary) hover:text-(--primary) transition-all duration-200 px-2 py-1">
                          <button className="text-sm cursor-pointer text-(--text-secondary) hover:text-(--primary)">
                            Modifier
                          </button>
                        </div>
                      </Link>
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
            {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)} sur{" "}
            {totalSuppliers} fournisseurs
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
