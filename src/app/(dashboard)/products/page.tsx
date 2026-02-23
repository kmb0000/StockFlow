"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import SearchBar from "@/components/ui/search-input";
import Select from "@/components/ui/select";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getAll } from "@/services/products.service";
import { cn } from "@/utils/cn";
import { ArrowDownToLine, CircleFadingPlus, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function getStockColor(quantity: number): string {
  if (quantity === 0) return "text-[#EF4444]";
  if (quantity <= 20) return "text-[#F59E0B]";
  return "text-[#10B981]";
}

function getStockStatus(quantity: number): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (quantity === 0) return { label: "Rupture", variant: "danger" };
  if (quantity <= 20) return { label: "Stock bas", variant: "warning" };
  return { label: "En stock", variant: "success" };
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //state filtre
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const categories = [
    ...new Set(products.map((p) => p.category_name).filter(Boolean)),
  ] as string[];
  const suppliers = [
    ...new Set(products.map((p) => p.supplier_name).filter(Boolean)),
  ] as string[];

  //filtrer barre de recherche catégorie status-stock fournisseur
  const filteredProducts = products
    .filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
      );
    })
    .filter((p) => {
      if (!categoryFilter) return true;
      return p.category_name === categoryFilter;
    })
    .filter((p) => {
      if (!supplierFilter) return true;
      return p.supplier_name === supplierFilter;
    })
    .filter((p) => {
      if (!stockFilter) return true;
      if (stockFilter === "En stock") return p.quantity > 20;
      if (stockFilter === "Stock bas")
        return p.quantity > 0 && p.quantity <= 20;
      if (stockFilter === "Rupture") return p.quantity === 0;
      return true;
    });

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

  //Filtrage des stats

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.quantity >= 20).length;
  const lowStock = products.filter(
    (p) => p.quantity > 0 && p.quantity <= 20,
  ).length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-[#EF4444]">{error}</p>;
  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="p-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Produits</h1>
          <p className="text-(--text-secondary)">
            Gérez votre inventaire de produits
          </p>
        </div>

        <div>
          <Link href="/products/new">
            <Button>
              <CircleFadingPlus className="w-5 h-5" /> Ajouter un produit
            </Button>
          </Link>
        </div>
      </div>
      {/* CARD */}
      <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-end">
          <div>
            <SearchBar
              placeholder="Nom, SKU, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            label="Catégorie"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Select
            label="Status stock"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">Tous</option>
            <option>En stock</option>
            <option>Stock bas</option>
            <option>Rupture</option>
          </Select>
          <Select
            label={"Fournisseur"}
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <option value="">Tous</option>
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </Select>

          <Button
            className="hover:border-(--primary) hover:text-(--primary)"
            variant="secondary"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setStockFilter("");
              setSupplierFilter("");
            }}
          >
            Rénitialiser
          </Button>
        </div>
      </div>
      {/* STATS */}
      <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6 flex justify-around gap-3 text-center">
        <div className="flex flex-col gap-1">
          <span className="text-xl text-(--text-secondary)">
            Total produits
          </span>
          <span className="text-2xl font-bold">{totalProducts}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xl text-(--text-secondary)">En stock</span>
          <span className="text-2xl font-bold text-[#10B981]">{inStock}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xl text-(--text-secondary)">Stock bas</span>
          <span className="text-2xl font-bold text-[#F59E0B]">{lowStock}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xl text-(--text-secondary)">Rupture</span>
          <span className="text-2xl font-bold text-[#EF4444]">
            {outOfStock}
          </span>
        </div>
      </div>

      <div className="bg-(--bg-card) border border-(--border) rounded-xl">
        <div className="flex justify-between items-center px-6 py-6">
          <h3 className="text-xl font-bold">Liste des produits</h3>
          <div className="flex gap-5">
            <button
              title="Exporter"
              className="rounded-lg border border-(--border) hover:border-(--primary) transition-all duration-200 opacity-70 hover:opacity-100 p-3 hover:text-(--primary)"
            >
              <ArrowDownToLine className="w-5 h-5" />
            </button>
            <button
              title="Imprimer"
              className="rounded-lg border border-(--border) hover:border-(--primary) transition-all duration-200 opacity-70 hover:opacity-100 p-3 hover:text-(--primary)"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-(--border)  text-red-400 text-sm opacity-60 rounded-xl">
            <tr>
              <th className="px-6 py-4">PRODUIT</th>
              <th className="px-6 py-4">CATEGORIE</th>
              <th className="px-6 py-4">PRIX</th>
              <th className="px-6 py-4">STOCK</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="bg-(--bg-card) text-(--text-primary) hover:bg-(--border) text-sm rounded-xl"
              >
                <td className="px-6 py-6">
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-(--text-secondary) font-mono">
                      {product.sku}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">{product.category_name}</td>
                <td className="px-6 py-6">{product.selling_price} €</td>
                <td className="px-6 py-6">
                  <span
                    className={cn(
                      "font-semibold",
                      getStockColor(product.quantity),
                    )}
                  >
                    {product.quantity}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <Badge variant={getStockStatus(product.quantity).variant}>
                    {getStockStatus(product.quantity).label}
                  </Badge>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md border border-gray-500 hover:border-(--primary) hover:text-(--primary) transition-all duration-200 px-2 py-1">
                      <button className="cursor-pointer">Voir</button>
                    </div>
                    <div className="rounded-md border border-gray-500 hover:border-(--primary) hover:text-(--primary) transition-all duration-200 px-2 py-1">
                      <button className="cursor-pointer">Modifier</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
