"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Category } from "@/lib/categories/categories.types";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getById, deleteCategorie } from "@/services/categories.service";
import { getAll as getAllProducts } from "@/services/products.service";
import { getStockStatus } from "@/utils/product-helpers";
import {
  Pencil,
  Trash2,
  ArrowDownToLine,
  ExternalLink,
  ChevronLeft,
  Package,
  Boxes,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function CategoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [cat, allProducts] = await Promise.all([
          getById(id),
          getAllProducts(),
        ]);
        setCategory(cat);
        setProducts(allProducts);
      } catch (err) {
        console.error(`[CategoryDetail] Erreur fetch :`, err);
        setError("Erreur lors du chargement de la catégorie");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-(--text-secondary)">
        Chargement des détails...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center">
        <p className="text-(--error) bg-(--error)/10 p-4 rounded-xl inline-block">
          {error}
        </p>
      </div>
    );

  if (!category) return null;

  const categoryProducts = products.filter((p) => p.category_id === id);
  const totalStockValue = categoryProducts.reduce(
    (acc, p) => acc + p.quantity * Number(p.purchase_price || 0),
    0,
  );
  const lowStock = categoryProducts.filter(
    (p) => p.quantity <= 20 && p.quantity > 0,
  ).length;
  const outOfStock = categoryProducts.filter((p) => p.quantity === 0).length;
  const totalUnits = categoryProducts.reduce((acc, p) => acc + p.quantity, 0);
  const accentColor = category.color ?? "#0066FF";

  const handleDelete = async () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        await deleteCategorie(id);
        router.push("/categories");
      } catch (err) {
        console.error(`[CategoryDetail] Erreur delete :`, err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER & ACTIONS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--primary) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour aux catégories
          </Link>
          <h1 className="text-3xl font-black tracking-tight">
            Détail de la catégorie
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href={`/categories/${id}/edit`} className="flex-1 md:flex-none">
            <Button variant="secondary" className="w-full">
              <Pencil className="w-4 h-4 text-(--warning)" /> Modifier
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            className="flex-1 md:flex-none border border-(--error)/30 bg-transparent text-(--error) hover:bg-(--error)/10"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div
            className="w-32 h-32 text-6xl flex items-center justify-center rounded-3xl shadow-inner shrink-0"
            style={{
              backgroundColor: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            {category.icon}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl font-black">{category.name}</h2>
              <p className="text-(--text-secondary) mt-2 max-w-2xl text-lg leading-relaxed">
                {category.description ||
                  "Aucune description fournie pour cette catégorie."}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-(--text-secondary)">
              <div className="flex items-center gap-2 px-3 py-1 bg-(--bg-body) rounded-full border border-(--border)">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="font-mono">{accentColor}</span>
              </div>
              <span>•</span>
              <span>
                Créée le{" "}
                {new Date(category.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Produits",
            val: categoryProducts.length,
            icon: Package,
            color: "text-(--text-primary)",
          },
          {
            label: "Unités",
            val: totalUnits,
            icon: Boxes,
            color: "text-(--primary)",
          },
          {
            label: "Valeur",
            val: `${Math.round(totalStockValue)}€`,
            icon: TrendingDown,
            color: "text-(--success)",
          },
          {
            label: "Alertes",
            val: lowStock + outOfStock,
            icon: AlertTriangle,
            color: outOfStock > 0 ? "text-(--error)" : "text-(--warning)",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 flex flex-col items-center justify-center gap-1 shadow-sm"
          >
            <stat.icon className={`w-5 h-5 mb-1 opacity-50 ${stat.color}`} />
            <span className={`text-2xl font-black ${stat.color}`}>
              {stat.val}
            </span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-(--text-secondary)">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* PRODUCT LIST */}
      <section className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-(--border) flex justify-between items-center bg-(--bg-card)">
          <h3 className="text-xl font-bold">Produits liés</h3>
          <button
            className="p-2 hover:bg-(--bg-body) rounded-lg border border-(--border) transition-colors text-(--text-secondary) hover:text-(--primary) cursor-pointer"
            title="Exporter"
          >
            <ArrowDownToLine className="w-5 h-5" />
          </button>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="text-6xl grayscale opacity-30">📦</div>
            <p className="text-(--text-secondary) font-medium">
              Aucun produit dans cette catégorie
            </p>
            <Link href="/products/new" className="inline-block">
              <Button variant="secondary" className="mt-2">
                Ajouter un produit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-200">
              <thead>
                <tr className="text-(--text-secondary) text-xs uppercase tracking-widest bg-(--bg-body)/50">
                  <th className="px-6 py-4 text-left font-bold">Produit</th>
                  <th className="px-6 py-4 text-left font-bold">
                    Prix Achat/Vente
                  </th>
                  <th className="px-6 py-4 text-left font-bold">Stock</th>
                  <th className="px-6 py-4 text-left font-bold">
                    Valeur Totale
                  </th>
                  <th className="px-6 py-4 text-left font-bold">Statut</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {categoryProducts.map((product) => {
                  const stockValue =
                    product.quantity * Number(product.purchase_price || 0);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-(--primary-alpha)/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-(--bg-body) border border-(--border) text-xl shadow-inner">
                            {category.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold group-hover:text-(--primary) transition-colors">
                              {product.name}
                            </span>
                            <span className="text-[10px] font-mono opacity-50">
                              {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-semibold">
                            {product.purchase_price}€
                          </span>
                          <span className="mx-2 opacity-20">/</span>
                          <span className="text-(--text-secondary)">
                            {product.selling_price}€
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={`font-black ${product.quantity <= 10 ? "text-(--error)" : ""}`}
                          >
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-(--success)">
                        {stockValue.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={getStockStatus(product.quantity).variant}
                        >
                          {getStockStatus(product.quantity).label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/products/${product.id}`}>
                          <button
                            className="p-2 rounded-lg border border-(--border) hover:border-(--primary) hover:text-(--primary) transition-all cursor-pointer"
                            title="Détail du produit"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
