"use client";

import Button from "@/components/ui/button";
import { Category } from "@/lib/categories/categories.types";
import { getAll } from "@/services/categories.service";
import { CircleFadingPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

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
          <Link href={`/products/new`}>
            <Button>
              <CircleFadingPlus className="w-5 h-5" />
              Nouvelle catégorie
            </Button>
          </Link>
        </div>
      </header>
      {/* SECTION STATS */}
      <div className="bg-(--bg-card) border border-(--border) p-6 rounded-xl flex justify-around gap-6">
        <div className="flex flex-col gap-2">
          <span>Total catégories</span>
          <span>{categories.length}</span>
        </div>
        <div className="flex flex-col">
          <span>Produits catégorisés</span>
          <span>-</span>
        </div>
        <div className="flex flex-col">
          <span>Catégorie la plus grande</span>
          <span>-</span>
        </div>
      </div>

      {/* SECTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((categorie) => {
          const color = categorie.color ?? "#0066FF";

          return (
            <div
              key={categorie.id}
              className="bg-(--bg-card) border border-(--border) rounded-xl p-5 transition-all duration-200 hover:-translate-y-2 hover:border-(--primary)"
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
                  <Link href="#">
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
                  <div>-</div>
                  <div className="text-(--text-secondary) text-sm">
                    Produits
                  </div>
                </div>
                <div className="flex flex-col">
                  <div>-</div>
                  <div className="text-(--text-secondary) text-sm">
                    Valeur stock
                  </div>
                </div>
                <div className="flex flex-col">
                  <div>-</div>
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
