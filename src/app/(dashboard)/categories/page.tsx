"use client";

import Button from "@/components/ui/button";
import { Category } from "@/lib/categories/categories.types";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getAll } from "@/services/categories.service";
import { getAll as getAllProducts } from "@/services/products.service";
import { CircleFadingPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Categories() {
  //state globals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  //useEffect pour categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAll();
        setCategories(data);
      } catch {
        setError("Erreur lors de la récupération des catégories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  //useEffect pour products
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

  const categorizedProducts = products.filter((p) => p.category_id).length;

  const result = categories.reduce(
    (acc, categorie) => {
      const count = products.filter(
        (p) => p.category_id === categorie.id,
      ).length;

      return count > acc.count ? { name: categorie.name, count } : acc;
    },
    { name: null as string | null, count: 0 },
  );

  const categorieWinner = result.name;

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-(--error)">{error}</p>;
  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-5">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-black">Catégories</h1>
          <p className="opacity-50">Gérez les catégories de votre inventaire</p>
        </div>
        <div>
          <Link href={`/categories/new`}>
            <Button>
              <CircleFadingPlus className="w-5 h-5" />
              Nouvelle catégorie
            </Button>
          </Link>
        </div>
      </header>
      {/* SECTION STATS */}
      <div className="bg-(--bg-card) border border-(--border) p-6 rounded-xl flex justify-around text-center gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">
            Total catégories
          </span>
          <span className="text-3xl font-black">{categories.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">
            Produits catégorisés
          </span>
          <span className="text-3xl text-(--success) font-black">
            {categorizedProducts}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">
            Catégorie la plus grande
          </span>
          <span className="text-3xl text-(--primary) font-black">
            {categorieWinner ?? "-"}
          </span>
        </div>
      </div>

      {/* SECTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((categorie) => {
          const color = categorie.color ?? "#0066FF";
          const productPerCategorie = products.filter(
            (p) => p.category_id === categorie.id,
          );
          const valueStock = productPerCategorie.reduce((acc, product) => {
            return acc + product.quantity * Number(product.purchase_price);
          }, 0);

          const lowStock = productPerCategorie.filter(
            (p) => p.quantity <= 20 && p.quantity > 0,
          ).length;

          return (
            <div
              key={categorie.id}
              className="bg-(--bg-card) border border-(--border) rounded-xl p-5 transition-all duration-200 hover:-translate-y-2 hover:border-(--primary) cursor-pointer"
            >
              <div className="flex justify-between items-start mb-5">
                <div
                  className="w-14 h-14 text-4xl flex justify-center items-center rounded-xl"
                  style={{
                    backgroundColor: `${color}20`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {categorie.icon}
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href={`/categories/${categorie.id}/edit`}>
                    <button
                      title="Modifier"
                      className="bg-transparent border border-(--border) p-2 text-sm hover:border-(--primary) transition-all duration-200 rounded-lg"
                    >
                      ✏️
                    </button>
                  </Link>
                  <button
                    title="Supprimer"
                    className="bg-transparent border border-(--border) p-2 text-sm hover:border-(--error) transition-all duration-200 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="text-xl font-bold mb-2">{categorie.name}</div>
              <div className="text-(--text-secondary) mb-5">
                {categorie.description}
              </div>
              <div className="flex justify-between text-center gap-6 pt-4 border-t border-(--border)">
                <div className="flex flex-col">
                  <div className="text-xl font-black">
                    {productPerCategorie.length}
                  </div>
                  <div className="text-(--text-secondary) text-sm">
                    Produits
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-xl font-black text-(--success)">
                    {valueStock}€
                  </div>
                  <div className="text-(--text-secondary) text-sm">
                    Valeur stock
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-xl font-black text-(--warning)">
                    {lowStock}
                  </div>
                  <div className="text-(--text-secondary) text-sm">
                    Stock bas
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
