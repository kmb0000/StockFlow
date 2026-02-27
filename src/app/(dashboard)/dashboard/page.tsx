"use client";

import StatCard from "@/components/ui/stat-card";
import { ProductWithRelations } from "@/lib/products/products.types";
import { StockMovementWithRelations } from "@/lib/stock_movements/stock_movements.types";
import { getAll } from "@/services/products.service";
import { getAll as getAllMovements } from "@/services/movements.service";
import { getAll as getAllCategories } from "@/services/categories.service";
import {
  AlertCircle,
  AlertTriangle,
  DollarSign,
  Inbox,
  Package,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/ui/badge";
import { getMovementType, getRelativeTime } from "@/utils/movement-helpers";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Category } from "@/lib/categories/categories.types";

export default function Dashboard() {
  //states globals
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movements, setMovements] = useState<StockMovementWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  //variables
  const totalProducts = products.length;
  const stockValue = products.reduce((acc, product) => {
    return acc + product.quantity * Number(product.purchase_price);
  }, 0);

  const lowStock = products.filter(
    (p) => p.quantity <= 20 && p.quantity > 0,
  ).length;

  const rupture = products.filter((p) => p.quantity === 0).length;

  const recentMovements = movements.slice(0, 5);
  //fetchMovements
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = await getAllMovements();
        setMovements(data);
      } catch {
        setError("Erreur lors de la recupération des mouvements");
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);
  //fetchProducts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAll();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  //fetchCategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch {
        setError("Erreur lors de la récupération des catégories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryData = useMemo(() => {
    return categories.map((categorie) => {
      const productCount = products.filter(
        (p) => p.category_id === categorie.id,
      ).length;

      return {
        name: categorie.name,
        value: productCount,
        color: categorie.color ?? "#0066FF",
      };
    });
  }, [categories, products]);

  //function
  function groupMovementByLast7Days(movement: StockMovementWithRelations[]) {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayLabel = date.toLocaleDateString("fr-FR", {
        weekday: "short",
      });

      //On garde seulement les mouvements de ce jour
      const movementsOfDay = movement.filter((movement) => {
        const movementDate = new Date(movement.created_at);

        return (
          movementDate.getDate() === date.getDate() &&
          movementDate.getMonth() === date.getMonth() &&
          movementDate.getFullYear() === date.getFullYear()
        );
      });

      //Total entrées
      const entries = movementsOfDay
        .filter((m) => m.type === "IN")
        .reduce((acc, m) => acc + m.quantity, 0);

      //Total sorties
      const exits = movementsOfDay
        .filter((m) => m.type === "OUT")
        .reduce((acc, m) => acc + m.quantity, 0);

      result.push({
        day: dayLabel,
        entries,
        exits,
      });
    }
    return result;
  }
  const chartData = groupMovementByLast7Days(movements);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-(--error)">{error}</p>;
  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
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
          value={totalProducts}
          Icon={Package}
          variant={"blue"}
          change={"↑ 12% ce mois ci"}
          changeType={"positive"}
        />

        <StatCard
          label={"Valeur stock"}
          value={`${stockValue.toFixed(0)}€`}
          Icon={DollarSign}
          variant={"green"}
          change={"↑ +8,2% ce mois"}
          changeType={"positive"}
        />

        <StatCard
          label={"Stock bas"}
          value={lowStock}
          Icon={AlertTriangle}
          variant={"yellow"}
          change={"↑ +5 cette semaine"}
          changeType={"negative"}
        />

        <StatCard
          label={"Rupture de stock"}
          value={rupture}
          Icon={AlertCircle}
          variant={"red"}
          change={"↑ +2 cette semaine"}
          changeType={"negative"}
        />
      </section>

      {/* ================ CHARTS ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--bg-card) border border-(--border) rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Mouvements de stock
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entries" fill="#10B981" name="Entrées" />
              <Bar dataKey="exits" fill="#EF4444" name="Sorties" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Répartition par catégorie
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ============= ACTIVITÉ RÉCENTE ============= */}
      <section className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Activité récente</h2>
          <button className="text-(--primary)">Voir tout →</button>
        </div>

        <div className="flex flex-col gap-4">
          {recentMovements.map((movement) => {
            return (
              <div
                key={movement.id}
                className="flex items-center gap-4 p-4 bg-[rgba(255,255,255,0.02)] rounded-lg transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
              >
                <div className="flex justify-center items-center rounded-lg w-10 h-10 shrink-0 text-xl">
                  {movement.type === "IN" ? (
                    <Inbox color="green" />
                  ) : (
                    <Inbox color="red" />
                  )}
                </div>
                <div className=" flex flex-col flex-1 gap-1">
                  <div>
                    <span className="text-xl font-medium">
                      {movement.product_name}
                    </span>
                    <span className="text-sm">
                      {" "}
                      - {movement.type === "IN" ? "Entrée" : "Sortie"} de{" "}
                      {movement.quantity} unités
                    </span>
                  </div>
                  <div className="text-xs text-(--text-secondary)">
                    {getRelativeTime(movement.created_at)}
                  </div>
                </div>
                <div>
                  <Badge variant={getMovementType(movement.type).variant}>
                    {getMovementType(movement.type).label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
