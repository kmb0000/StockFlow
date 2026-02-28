"use client";

import Button from "@/components/ui/button";
import { Category } from "@/lib/categories/categories.types";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getAll } from "@/services/categories.service";
import { getAll as getAllProducts } from "@/services/products.service";
import {
  CircleFadingPlus,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  PackageCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          getAll(),
          getAllProducts(),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err) {
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categorizedProductsCount = products.filter((p) => p.category_id).length;

  const winner = categories.reduce(
    (acc, cat) => {
      const count = products.filter((p) => p.category_id === cat.id).length;
      return count > acc.count ? { name: cat.name, count } : acc;
    },
    { name: null as string | null, count: 0 },
  );

  if (loading)
    return (
      <div className="p-8 flex justify-center items-center min-h-100">
        <p className="animate-pulse opacity-50">Chargement des catégories...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-[#EF4444] bg-[#EF4444]/10 p-4 rounded-lg inline-block">
          {error}
        </p>
      </div>
    );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER RESPONSIVE */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Catégories</h1>
          <p className="text-(--text-secondary) text-sm">
            Structurez et organisez votre catalogue produit
          </p>
        </div>
        <Link href="/categories/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto  shadow-(--primary-alpha)">
            <CircleFadingPlus className="w-5 h-5" />
            Nouvelle catégorie
          </Button>
        </Link>
      </header>

      {/* SECTION STATS - GRILLE MODERNE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-(--primary)/10 flex items-center justify-center text-(--primary)">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-(--text-secondary) uppercase font-bold tracking-wider">
              Total
            </p>
            <p className="text-2xl font-black">{categories.length}</p>
          </div>
        </div>

        <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-(--text-secondary) uppercase font-bold tracking-wider">
              Produits Liés
            </p>
            <p className="text-2xl font-black text-[#10B981]">
              {categorizedProductsCount}
            </p>
          </div>
        </div>

        <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-(--text-secondary) uppercase font-bold tracking-wider">
              Top Catégorie
            </p>
            <p className="text-xl font-black truncate">
              {winner.name ?? "Aucune"}
            </p>
          </div>
        </div>
      </div>

      {/* GRILLE DE CARTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          const totalValue = catProducts.reduce(
            (sum, p) => sum + p.quantity * Number(p.purchase_price || 0),
            0,
          );
          const lowStockCount = catProducts.filter(
            (p) => p.quantity <= 10,
          ).length;
          const accentColor = cat.color || "#0066FF";

          return (
            <div
              key={cat.id}
              className="group bg-(--bg-card) border border-(--border) rounded-2xl p-6 transition-all duration-300 hover:border-(--primary) hover:shadow-xl flex flex-col h-full"
            >
              {/* TOP CARD */}
              <div className="flex justify-between items-start mb-6">
                <div
                  className="w-14 h-14 text-3xl flex items-center justify-center rounded-2xl shadow-inner"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  {cat.icon || "📁"}
                </div>
                <div className="flex gap-2">
                  <Link href={`/categories/${cat.id}/edit`}>
                    <button className="p-2 rounded-lg border border-(--border) hover:bg-(--bg-body) text-(--text-secondary) hover:text-(--primary) transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Link>
                  <button className="p-2 rounded-lg border border-(--border) hover:bg-(--bg-body) text-(--text-secondary) hover:text-[#EF4444] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold group-hover:text-(--primary) transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-(--text-secondary) line-clamp-2 leading-relaxed">
                  {cat.description ||
                    "Aucune description fournie pour cette catégorie."}
                </p>
              </div>

              {/* FOOTER CARD - STATS */}
              <div className="grid grid-cols-3 gap-2 pt-6 mt-6 border-t border-(--border)">
                <div className="text-center">
                  <p className="text-lg font-black">{catProducts.length}</p>
                  <p className="text-[10px] uppercase font-bold opacity-40">
                    Items
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-[#10B981]">
                    {Math.round(totalValue)}€
                  </p>
                  <p className="text-[10px] uppercase font-bold opacity-40">
                    Valeur
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className={`text-lg font-black ${lowStockCount > 0 ? "text-[#EF4444]" : "opacity-20"}`}
                  >
                    {lowStockCount}
                  </p>
                  <p className="text-[10px] uppercase font-bold opacity-40">
                    Alertes
                  </p>
                </div>
              </div>

              <Link href={`/categories/${cat.id}`} className="mt-6">
                <Button
                  variant="secondary"
                  className="w-full text-xs py-2 group-hover:border-(--primary)"
                >
                  Consulter les produits
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
