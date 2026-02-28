"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Supplier } from "@/lib/suppliers/suppliers.type";
import { ProductWithRelations } from "@/lib/products/products.types";
import { getById, deleteSupplier } from "@/services/suppliers.service";
import { getAll as getAllProducts } from "@/services/products.service";
import { getStockStatus } from "@/utils/product-helpers";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  Loader2,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useMemo } from "react";

export default function SupplierDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // --- ÉTATS ---
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [sup, allProducts] = await Promise.all([
          getById(id),
          getAllProducts(),
        ]);

        if (!sup) {
          console.warn(
            `[SupplierDetail] Tentative d'accès à un ID inexistant : ${id}`,
          );
          setError("Fournisseur introuvable.");
          return;
        }

        setSupplier(sup);
        // Filtrage des produits liés à ce fournisseur
        setProducts(allProducts.filter((p) => p.supplier_id === id));
      } catch (err) {
        console.error(`[SupplierDetail] Erreur fetch ID ${id}:`, err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // --- CALCUL DES STATS (Optimisé avec useMemo) ---
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0);
    const totalValue = products.reduce(
      (acc, p) => acc + p.quantity * Number(p.purchase_price),
      0,
    );
    const lowStock = products.filter(
      (p) => p.quantity <= 20 && p.quantity > 0,
    ).length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;

    return { totalProducts, totalUnits, totalValue, lowStock, outOfStock };
  }, [products]);

  // --- ACTIONS ---
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSupplier(id);
      router.push("/suppliers");
    } catch (err) {
      console.error(`[SupplierDetail] Erreur delete ID ${id}:`, err);
      alert(
        "Erreur : Impossible de supprimer ce fournisseur (il est probablement lié à des produits existants).",
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-(--primary)" />
        <p className="text-(--text-secondary) animate-pulse">
          Chargement du partenaire...
        </p>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-(--error) font-medium">
          {error || "Fournisseur introuvable"}
        </p>
        <Link href="/suppliers">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
            <Link
              href="/dashboard"
              className="hover:text-(--primary) flex items-center gap-1"
            >
              <LayoutDashboard className="w-3 h-3" /> Dashboard
            </Link>
            <span>/</span>
            <Link href="/suppliers" className="hover:text-(--primary)">
              Fournisseurs
            </Link>
            <span>/</span>
            <span className="text-(--text-primary)">{supplier.name}</span>
          </nav>
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-(--primary)">
            Détail Partenaire
          </h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Link href={`/suppliers/${id}/edit`} className="flex-1 md:flex-none">
            <Button
              variant="secondary"
              className="w-full gap-2 border-(--border) hover:border-orange-500/50"
            >
              <Pencil className="w-4 h-4 text-orange-500" /> Modifier
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 md:flex-none border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 gap-2"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Supprimer
          </Button>
        </div>
      </header>

      {/* HERO CARD */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Globe className="w-32 h-32 rotate-12" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-(--primary) flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-primary/20">
            {supplier.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-4xl font-black tracking-tight">
                {supplier.name}
              </h2>
              <Badge variant={supplier.is_active ? "success" : "danger"}>
                {supplier.is_active ? "Partenaire Actif" : "Partenaire Inactif"}
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-(--text-secondary) font-medium">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />{" "}
                {supplier.contact_person || "Pas de contact"}
              </span>
              <span>•</span>
              <span>
                Inscrit le{" "}
                {new Date(supplier.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE : STATS & PRODUITS (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* GRILLE DE STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Produits"
              value={stats.totalProducts}
              color="text-(--text-primary)"
            />
            <StatCard
              label="Volume Stock"
              value={stats.totalUnits}
              color="text-(--primary)"
            />
            <StatCard
              label="Valeur Achat"
              value={`${stats.totalValue.toLocaleString()} €`}
              color="text-(--success)"
            />
            <StatCard
              label="Ruptures"
              value={stats.outOfStock}
              color="text-(--error)"
            />
          </div>

          {/* TABLEAU DES PRODUITS */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-(--border) flex justify-between items-center bg-[rgba(255,255,255,0.01)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1 h-5 bg-(--primary) rounded-full"></span>
                Catalogue Fournisseur
              </h3>
              <Badge variant="blue">{stats.totalProducts} Références</Badge>
            </div>

            <div className="overflow-x-auto">
              {products.length === 0 ? (
                <div className="p-12 text-center text-(--text-secondary)">
                  <p className="italic">
                    Aucun produit rattaché à ce fournisseur pour le moment.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-(--text-secondary) bg-(--bg-body)/50">
                      <th className="px-6 py-4 font-bold">Produit</th>
                      <th className="px-6 py-4 font-bold">Stock</th>
                      <th className="px-6 py-4 font-bold">
                        Prix (Achat/Vente)
                      </th>
                      <th className="px-6 py-4 font-bold">Statut</th>
                      <th className="px-6 py-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-(--primary-alpha)/5 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold group-hover:text-(--primary) transition-colors">
                              {product.name}
                            </span>
                            <span className="text-xs text-(--text-secondary)">
                              {product.sku}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-(--text-secondary)">
                            {product.purchase_price}€
                          </span>
                          <span className="mx-2">/</span>
                          <span className="font-bold">
                            {product.selling_price}€
                          </span>
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
                            <button className="p-2 hover:bg-(--primary) hover:text-white rounded-lg transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : INFOS CONTACT (1/3) */}
        <div className="space-y-6">
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold pb-4 border-b border-(--border)">
              Coordonnées
            </h3>

            <div className="space-y-4">
              <ContactItem
                icon={<Mail className="text-blue-500" />}
                label="Email"
                value={supplier.email}
                isLink
              />
              <ContactItem
                icon={<Phone className="text-green-500" />}
                label="Téléphone"
                value={supplier.phone}
              />
              <ContactItem
                icon={<Globe className="text-purple-500" />}
                label="Site Web"
                value={supplier.website}
                isLink
              />
              <ContactItem
                icon={<MapPin className="text-red-500" />}
                label="Localisation"
                value={
                  supplier.city
                    ? `${supplier.city}, ${supplier.country}`
                    : supplier.country
                }
              />
            </div>

            {supplier.address && (
              <div className="mt-4 p-4 bg-(--bg-body) rounded-xl border border-(--border) text-sm text-(--text-secondary)">
                <p className="font-bold text-(--text-primary) mb-1">
                  Adresse complète :
                </p>
                {supplier.address}
                <br />
                {supplier.postal_code} {supplier.city}
              </div>
            )}
          </div>

          {/* NOTES INTERNES */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-amber-600 font-bold mb-3 flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Notes de collaboration
            </h3>
            <p className="text-sm text-(--text-secondary) italic leading-relaxed">
              {supplier.notes || "Aucune note interne pour ce fournisseur."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS UTILITAIRES ---

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm text-center space-y-1">
      <span className={`text-2xl font-black tracking-tight ${color}`}>
        {value}
      </span>
      <p className="text-[10px] uppercase font-bold text-(--text-secondary) tracking-widest">
        {label}
      </p>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  isLink = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-(--bg-body) border border-(--border) flex items-center justify-center shrink-0 group-hover:border-(--primary) transition-colors">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase font-bold text-(--text-secondary)">
          {label}
        </span>
        <span
          className={`font-medium truncate ${isLink ? "text-(--primary) hover:underline cursor-pointer" : ""}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
