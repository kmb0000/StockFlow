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
  ArrowRight,
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
import Button from "@/components/ui/button"; // Import du bouton standardisé
import { cn } from "@/utils/cn";

export default function Dashboard() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movements, setMovements] = useState<StockMovementWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // --- LOGIQUE (Identique à ton code) ---
  const totalProducts = products.length;
  const stockValue = products.reduce((acc, product) => {
    return acc + product.quantity * Number(product.purchase_price);
  }, 0);
  const lowStock = products.filter(
    (p) => p.quantity <= 20 && p.quantity > 0,
  ).length;
  const rupture = products.filter((p) => p.quantity === 0).length;
  const recentMovements = movements.slice(0, 5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, movData, catData] = await Promise.all([
          getAll(),
          getAllMovements(),
          getAllCategories(),
        ]);
        setProducts(prodData);
        setMovements(movData);
        setCategories(catData);
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryData = useMemo(() => {
    return categories.map((categorie) => ({
      name: categorie.name,
      value: products.filter((p) => p.category_id === categorie.id).length,
      color: categorie.color ?? "#0066FF",
    }));
  }, [categories, products]);

  function groupMovementByLast7Days(movement: StockMovementWithRelations[]) {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString("fr-FR", { weekday: "short" });
      const movementsOfDay = movement.filter((m) => {
        const d = new Date(m.created_at);
        return (
          d.getDate() === date.getDate() && d.getMonth() === date.getMonth()
        );
      });
      result.push({
        day: dayLabel,
        entries: movementsOfDay
          .filter((m) => m.type === "IN")
          .reduce((acc, m) => acc + m.quantity, 0),
        exits: movementsOfDay
          .filter((m) => m.type === "OUT")
          .reduce((acc, m) => acc + m.quantity, 0),
      });
    }
    return result;
  }
  const chartData = groupMovementByLast7Days(movements);

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse text-(--text-secondary)">
        Chargement...
      </div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* ================= HEADER STANDARD ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
            Dashboard
          </h1>
          <p className="text-(--text-secondary) mt-1">
            Vue d&apos;ensemble de votre inventaire en temps réel.
          </p>
        </div>
        {/* On prévoit l'emplacement pour un bouton, même s'il est optionnel ici */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="hidden sm:flex">
            Exporter
          </Button>
        </div>
      </div>

      {/* ================ STATS (Responsive 2x2 sur mobile) ================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Produits"
          value={totalProducts}
          Icon={Package}
          variant="blue"
          change="+12% mois"
          changeType="positive"
        />
        <StatCard
          label="Valeur Stock"
          value={`${stockValue.toFixed(0)}€`}
          Icon={DollarSign}
          variant="green"
          change="+8.2% mois"
          changeType="positive"
        />
        <StatCard
          label="Stock Bas"
          value={lowStock}
          Icon={AlertTriangle}
          variant="yellow"
          change="+5 semaine"
          changeType="negative"
        />
        <StatCard
          label="Rupture"
          value={rupture}
          Icon={AlertCircle}
          variant="red"
          change="+2 semaine"
          changeType="negative"
        />
      </section>

      {/* ================ CHARTS ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--bg-card) border border-(--border) rounded-2xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-(--primary) rounded-full" />
            Flux de stock (7 jours)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "gray", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "gray", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    background: "#111",
                    border: "1px solid #333",
                  }}
                />
                <Bar
                  dataKey="entries"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="exits"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-purple-500 rounded-full" />
            Catégories
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ============= ACTIVITÉ RÉCENTE ============= */}
      <section className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="flex justify-between items-center p-5 border-b border-(--border)">
          <h2 className="text-lg font-bold">Derniers mouvements</h2>
          <button className="text-sm font-semibold text-(--primary) hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-(--border)">
          {recentMovements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  movement.type === "IN"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500",
                )}
              >
                <Inbox size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {movement.product_name}
                </p>
                <p className="text-xs text-(--text-secondary)">
                  {movement.type === "IN"
                    ? "Entrée de stock"
                    : "Sortie de stock"}{" "}
                  • {movement.quantity} unités
                </p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant={getMovementType(movement.type).variant}>
                  {getMovementType(movement.type).label}
                </Badge>
                <p className="text-[10px] text-(--text-secondary) mt-1">
                  {getRelativeTime(movement.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
