"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { ProductDetail } from "@/lib/products/products.types";
import { StockMovementWithRelations } from "@/lib/stock_movements/stock_movements.types";
import { create, getAll } from "@/services/movements.service";
import { deleteProduct, getById } from "@/services/products.service";
import { getMovementType, getRelativeTime } from "@/utils/movement-helpers";
import { getProductStatus, getStockStatus } from "@/utils/product-helpers";
import { Inbox, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailsProduct({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // States
  const [movements, setMovements] = useState<StockMovementWithRelations[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState<"IN" | "OUT" | null>(null);
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);
  const [movementForm, setMovementForm] = useState({
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, movementsData] = await Promise.all([
          getById(id),
          getAll(),
        ]);
        setProduct(productData);
        setMovements(movementsData);
      } catch (err) {
        console.error(`[DetailsProduct] Erreur fetch getById et getAll :`, err);
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;
    try {
      setIsDeleting(true);
      await deleteProduct(id);
      router.push("/products");
    } catch (err) {
      console.error(`[DetailsProduct] Erreur delete :`, err);
      alert("Erreur lors de la suppression");
      setIsDeleting(false);
    }
  };

  async function handleMovementSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalType || !movementForm.quantity) return;

    try {
      setIsSubmittingMovement(true);
      await create({
        product_id: id,
        type: modalType,
        quantity: Number(movementForm.quantity),
        reason:
          movementForm.reason ||
          (modalType === "IN" ? "Réapprovisionnement" : "Sortie de stock"),
      });

      // Reset & Refresh
      setModalType(null);
      setMovementForm({ quantity: "", reason: "" });
      const [updatedProduct, updatedMovements] = await Promise.all([
        getById(id),
        getAll(),
      ]);
      setProduct(updatedProduct);
      setMovements(updatedMovements);
    } catch (err) {
      console.error(`[DetailsProduct] Erreur enregistrement mouvements :`, err);
      alert("Erreur lors de l'enregistrement du mouvement");
    } finally {
      setIsSubmittingMovement(false);
    }
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <div className="w-8 h-8 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
        <p className="opacity-50">Chargement du produit...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-(--error)">{error || "Produit introuvable"}</p>
        <Link href="/products">
          <Button variant="secondary">Retour à la liste</Button>
        </Link>
      </div>
    );

  const productMovements = movements.filter((m) => m.product_id === id);
  const fiveLastMovements = productMovements.slice(0, 5);
  const categoryColor = product.category_color ?? "#0066FF";
  const stockValue = product.quantity * (Number(product.purchase_price) || 0);
  const margin =
    (Number(product.selling_price) || 0) -
    (Number(product.purchase_price) || 0);
  const marginPercent =
    Number(product.selling_price) > 0
      ? (margin / Number(product.selling_price)) * 100
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 opacity-50 text-xs sm:text-sm overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            <Link href="/dashboard" className="hover:text-(--primary)">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-(--primary)">
              Produits
            </Link>
            <span>/</span>
            <span className="text-(--text-primary)">{product.name}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black">Détail du produit</h1>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            href={`/products/${product.id}/edit`}
            className="flex-1 md:flex-none"
          >
            <Button className="w-full bg-transparent border border-(--border) hover:text-(--primary) hover:border-(--primary) transition-colors">
              <Pencil className="w-4 h-4 mr-2" /> Modifier
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 md:flex-none border border-red-500/30 hover:bg-red-500/10 text-red-500 bg-transparent disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />{" "}
            {isDeleting ? "..." : "Supprimer"}
          </Button>
        </div>
      </header>

      {/* PRODUCT MAIN CARD */}
      <div className="bg-(--bg-card) rounded-2xl border border-(--border) overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 p-6 sm:p-8">
          <div
            className="w-full md:w-48 h-48 rounded-2xl flex items-center justify-center text-7xl shrink-0"
            style={{
              backgroundColor: `${categoryColor}15`,
              border: `1px solid ${categoryColor}30`,
            }}
          >
            {product.category_icon || "📦"}
          </div>

          <div className="flex flex-col gap-5 flex-1">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold">{product.name}</h2>
              <p className="text-sm opacity-50 font-mono">
                {product.sku} • Code: {product.barcode}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={getStockStatus(product.quantity).variant}>
                {getStockStatus(product.quantity).label}
              </Badge>
              <Badge variant="blue">
                {product.category_icon} {product.category_name}
              </Badge>
              <Badge variant={getProductStatus(product.status).variant}>
                {getProductStatus(product.status).label}
              </Badge>
            </div>

            <p className="text-(--text-secondary) leading-relaxed">
              {product.description ||
                "Aucune description fournie pour ce produit."}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md bg-white/5 border border-white/10 text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT & CENTER COLUMNS */}
        <div className="lg:col-span-2 space-y-8">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-(--bg-card) rounded-2xl border border-(--border) text-center space-y-1">
              <span className="block text-3xl font-black text-(--success)">
                {product.quantity}
              </span>
              <span className="text-xs uppercase tracking-widest opacity-40 font-bold">
                Stock Actuel
              </span>
            </div>
            <div className="p-6 bg-(--bg-card) rounded-2xl border border-(--border) text-center space-y-1">
              <span className="block text-3xl font-black text-(--primary)">
                {stockValue.toLocaleString()} €
              </span>
              <span className="text-xs uppercase tracking-widest opacity-40 font-bold">
                Valeur du Stock
              </span>
            </div>
            <div className="p-6 bg-(--bg-card) rounded-2xl border border-(--border) text-center space-y-1">
              <span className="block text-3xl font-black opacity-20">—</span>
              <span className="text-xs uppercase tracking-widest opacity-40 font-bold">
                Ventes (30j)
              </span>
            </div>
          </div>

          {/* DETAILS LIST */}
          <div className="bg-(--bg-card) rounded-2xl border border-(--border) p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-(--primary) rounded-full"></span>
              Informations détaillées
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              {[
                { label: "Prix d'achat", value: `${product.purchase_price} €` },
                { label: "Prix de vente", value: `${product.selling_price} €` },
                {
                  label: "Marge",
                  value: `${margin.toFixed(2)} € (${marginPercent.toFixed(1)}%)`,
                },
                {
                  label: "Emplacement",
                  value: product.location || "Non défini",
                },
                { label: "Seuil d'alerte", value: product.alert_threshold },
                {
                  label: "Unité / Poids",
                  value: `${product.unit} (${product.weight || "0"} kg)`,
                },
                { label: "Fournisseur", value: product.supplier_name },
                {
                  label: "Ajouté le",
                  value: getRelativeTime(product.created_at),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-white/5 pb-2"
                >
                  <span className="opacity-40 text-sm">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORY TABLE */}
          <div className="bg-(--bg-card) rounded-2xl border border-(--border) overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-(--border)">
              <h3 className="font-bold">Mouvements récents</h3>
              <Link
                href="/movements"
                className="text-xs text-(--primary) hover:underline"
              >
                Voir tout →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-(--text-secondary) uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Qté</th>
                    <th className="px-6 py-4">Raison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fiveLastMovements.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="px-6 py-4 opacity-60">
                        {getRelativeTime(m.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getMovementType(m.type).variant}>
                          {getMovementType(m.type).label}
                        </Badge>
                      </td>
                      <td
                        className={`px-6 py-4 font-bold ${m.type === "IN" ? "text-(--success)" : "text-red-500"}`}
                      >
                        {m.type === "IN" ? "+" : "-"}
                        {m.quantity}
                      </td>
                      <td className="px-6 py-4 opacity-60 truncate max-w-37.5">
                        {m.reason}
                      </td>
                    </tr>
                  ))}
                  {fiveLastMovements.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center opacity-30 italic"
                      >
                        Aucun mouvement enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (ACTIONS & SUPPLIER) */}
        <div className="space-y-8">
          <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl space-y-6">
            <h3 className="font-bold">Actions rapides</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setModalType("IN")}
                className="flex items-center gap-4 p-4 rounded-xl border border-(--border) hover:border-(--success) hover:bg-(--success)/5 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-(--success)/10 flex items-center justify-center text-(--success) group-hover:scale-110 transition-transform">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Entrée stock</div>
                  <div className="text-xs opacity-40">Ajouter des unités</div>
                </div>
              </button>

              <button
                onClick={() => setModalType("OUT")}
                className="flex items-center gap-4 p-4 rounded-xl border border-(--border) hover:border-red-500 hover:bg-red-500/5 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <Inbox className="w-6 h-6 rotate-180" />
                </div>
                <div>
                  <div className="font-bold">Sortie stock</div>
                  <div className="text-xs opacity-40">Retirer des unités</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl">
            <h3 className="font-bold mb-6">Contact Fournisseur</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Société
                </label>
                <p className="font-medium">{product.supplier_name}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Email
                </label>
                <p className="font-medium text-(--primary) truncate">
                  {product.supplier_email}
                </p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Téléphone
                </label>
                <p className="font-medium">{product.supplier_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL MOVEMENTS */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => !isSubmittingMovement && setModalType(null)}
        title={
          modalType === "IN"
            ? "Réception de marchandises"
            : "Sortie d'inventaire"
        }
      >
        <form onSubmit={handleMovementSubmit} className="space-y-5 mt-4">
          <Input
            label="Quantité à mouvementer"
            type="number"
            min="1"
            required
            value={movementForm.quantity}
            onChange={(e) =>
              setMovementForm({ ...movementForm, quantity: e.target.value })
            }
            placeholder="0"
          />
          <Input
            label="Motif / Commentaire"
            value={movementForm.reason}
            onChange={(e) =>
              setMovementForm({ ...movementForm, reason: e.target.value })
            }
            placeholder={
              modalType === "IN"
                ? "Ex: Commande n°123"
                : "Ex: Vente client ou Perte"
            }
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setModalType(null)}
              disabled={isSubmittingMovement}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${modalType === "IN" ? "bg-(--success) hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
              disabled={isSubmittingMovement}
            >
              {isSubmittingMovement ? "Traitement..." : "Confirmer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
