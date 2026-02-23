"use client";

import StatCard from "@/components/ui/stat-card";
import { getAll } from "@/services/products.service";
import { AlertCircle, AlertTriangle, DollarSign, Package } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [listProducts, setListProducts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAll();
        setListProducts(data);
      } catch (error) {
        console.error(error);
        setError("Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="p-5">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-(--text-secondary)">
          Vue d&apos;ensemble de votre inventaire
        </p>
      </div>

      {/* ================ STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* CARD */}
        <StatCard
          label={"Produit totaux"}
          value={"201"}
          Icon={Package}
          variant={"blue"}
          change={"↑ 12% ce mois ci"}
          changeType={"positive"}
        />

        <StatCard
          label={"Valeur stock"}
          value={"42,5K €"}
          Icon={DollarSign}
          variant={"green"}
          change={"↑ +8,2% ce mois"}
          changeType={"positive"}
        />

        <StatCard
          label={"Stock bas"}
          value={"23"}
          Icon={AlertTriangle}
          variant={"yellow"}
          change={"↑ +5 cette semaine"}
          changeType={"negative"}
        />

        <StatCard
          label={"Rupture de stock"}
          value={"7"}
          Icon={AlertCircle}
          variant={"red"}
          change={"↑ +2 cette semaine"}
          changeType={"negative"}
        />
      </section>

      {/* ================ CHARTS ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--bg-card) border border-(--border) rounded-xl p-6 h-80 flex items-center justify-center text-(--text-secondary)">
          Graphique mouvements de stock (à venir)
        </div>
        <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6 h-80 flex items-center justify-center text-(--text-secondary)">
          Répartition par catégorie (à venir)
        </div>
      </section>

      {/* ============= ACTIVITÉ RÉCENTE ============= */}
      <section className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        <p className="text-(--text-secondary)">À venir</p>
      </section>
    </div>
  );
}
