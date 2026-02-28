"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import SearchBar from "@/components/ui/search-input";
import Select from "@/components/ui/select";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getAll } from "@/services/products.service";
import { cn } from "@/utils/cn";
import {
  ArrowDownToLine,
  CircleFadingPlus,
  Printer,
  Eye,
  Edit3,
  FilterX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStockColor, getStockStatus } from "@/utils/product-helpers";
import Pagination from "@/components/ui/pagination";
import { exportProductsToCSV } from "@/utils/export-csv";

export default function Products() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtres
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const itemsPerPage = 8;

  // --- LOGIQUE DE FILTRAGE ---
  const categories = [
    ...new Set(products.map((p) => p.category_name).filter(Boolean)),
  ] as string[];
  const suppliers = [
    ...new Set(products.map((p) => p.supplier_name).filter(Boolean)),
  ] as string[];

  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s);
    const matchCat = !categoryFilter || p.category_name === categoryFilter;
    const matchSupp = !supplierFilter || p.supplier_name === supplierFilter;
    let matchStock = true;
    if (stockFilter === "En stock") matchStock = p.quantity > 20;
    if (stockFilter === "Stock bas")
      matchStock = p.quantity > 0 && p.quantity <= 20;
    if (stockFilter === "Rupture") matchStock = p.quantity === 0;

    return matchSearch && matchCat && matchSupp && matchStock;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAll();
        setProducts(data);
      } catch {
        setError("Une erreur est survenue pendant le chargement des produits");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse text-(--text-secondary)">
        Chargement de l&apos;inventaire...
      </div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
            Produits
          </h1>
          <p className="text-(--text-secondary) mt-1">
            Gérez votre inventaire et suivez les niveaux de stock.
          </p>
        </div>
        <Link href="/products/new">
          <Button className="w-full sm:w-auto">
            <CircleFadingPlus size={18} />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* ================ MINI STATS RAPIDES ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-(--text-secondary) font-medium uppercase">
            Total
          </p>
          <p className="text-xl font-bold mt-1">{products.length}</p>
        </div>
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-green-500 font-medium uppercase">
            En stock
          </p>
          <p className="text-xl font-bold mt-1 text-green-500">
            {products.filter((p) => p.quantity > 20).length}
          </p>
        </div>
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-orange-500 font-medium uppercase">
            Stock bas
          </p>
          <p className="text-xl font-bold mt-1 text-orange-500">
            {products.filter((p) => p.quantity > 0 && p.quantity <= 20).length}
          </p>
        </div>
        <div className="bg-(--bg-card) border border-(--border) p-4 rounded-xl">
          <p className="text-xs text-red-500 font-medium uppercase">Rupture</p>
          <p className="text-xl font-bold mt-1 text-red-500">
            {products.filter((p) => p.quantity === 0).length}
          </p>
        </div>
      </div>

      {/* ================ FILTRES ================= */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* AJOUT DE items-end ICI pour aligner le bas de la barre de recherche avec les selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              {/* On ajoute un label invisible ou un espace pour que la SearchBar descende à la même hauteur que les autres */}
              <label className="text-sm font-medium opacity-0 cursor-default select-none">
                Recherche
              </label>
              <SearchBar
                placeholder="Rechercher un nom, SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Select
              label="Catégorie"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select
              label="État du stock"
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tous les états</option>
              <option>En stock</option>
              <option>Stock bas</option>
              <option>Rupture</option>
            </Select>

            <Select
              label="Fournisseur"
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tous les fournisseurs</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </Select>
          </div>

          {(search || categoryFilter || stockFilter || supplierFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("");
                setStockFilter("");
                setSupplierFilter("");
              }}
              className="text-sm text-(--primary) flex items-center gap-1 hover:underline self-start"
            >
              <FilterX size={14} /> Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* ================= TABLEAU ================= */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-(--border) gap-4">
          <h3 className="text-lg font-bold text-(--text-primary)">
            Liste des produits
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                exportProductsToCSV(filteredProducts, "inventaire")
              }
              className="p-2 hover:bg-white/5 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--primary) transition-colors"
              title="Exporter CSV"
            >
              <ArrowDownToLine size={20} />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-white/5 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--primary) transition-colors"
              title="Imprimer"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-left border-b border-(--border)">
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider text-right">
                  Prix Vente
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider text-center">
                  Stock
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-(--text-secondary) uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {paginatedProducts.map((product) => {
                const color = product.category_color ?? "#0066FF";
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{
                            backgroundColor: `${color}15`,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {product.category_icon ?? "📦"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-(--text-primary)">
                            {product.name}
                          </span>
                          <span className="text-xs text-(--text-secondary) font-mono uppercase tracking-tighter">
                            {product.sku}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-(--text-secondary)">
                        {product.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-sm">
                      {product.selling_price} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          getStockColor(product.quantity),
                        )}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStockStatus(product.quantity).variant}>
                        {getStockStatus(product.quantity).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}`}>
                          <button
                            className="p-2 rounded-lg border border-(--border) hover:border-(--primary) hover:text-(--primary) transition-all"
                            title="Détails"
                          >
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link href={`/products/${product.id}/edit`}>
                          <button
                            className="p-2 rounded-lg border border-(--border) hover:border-(--primary) hover:text-(--primary) transition-all"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
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

        {/* ================= FOOTER / PAGINATION ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-(--border) gap-4">
          <p className="text-sm text-(--text-secondary)">
            Affichage de{" "}
            <span className="font-medium text-(--text-primary)">
              {startIndex + 1}
            </span>{" "}
            à{" "}
            <span className="font-medium text-(--text-primary)">
              {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-(--text-primary)">
              {filteredProducts.length}
            </span>{" "}
            produits
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
