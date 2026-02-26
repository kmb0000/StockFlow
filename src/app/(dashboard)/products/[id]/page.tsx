"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { ProductDetail } from "@/lib/products/products.types";
import { getById } from "@/services/products.service";
import { getProductStatus, getStockStatus } from "@/utils/product-helpers";
import { Inbox, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailsProduct({ params }: ProductDetailPageProps) {
  const { id } = use(params);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailProduct = async () => {
      try {
        const data = await getById(id);
        setProduct(data);
      } catch {
        setError("Erreur lors de la récupération du produit");
      } finally {
        setLoading(false);
      }
    };
    fetchDetailProduct();
  }, [id]);

  if (loading) return <p>Chargement du produit...</p>;
  if (error) return <p className="text-(--error)">{error}</p>;
  if (!product) return null;

  const categoryColor = product.category_color ?? "#0066FF";
  //calcul Valeur stock
  const stockValue = product.quantity * Number(product.purchase_price);

  //calcul de la marge
  const margin = Number(product.selling_price) - Number(product.purchase_price);
  const marginPercent =
    Number(product.selling_price) > 0
      ? (margin / Number(product.selling_price)) * 100
      : 0;

  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-5">
        <div className="flex flex-col gap-4">
          <nav className="flex gap-2 opacity-50 text-sm">
            <Link href="/dashboard" className="hover:text-(--primary)">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-(--primary)">
              Produits
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>
          <h1 className="text-3xl font-black">Détail du produit</h1>
          <p className="opacity-50">
            Consultez et gérez les informations du produit
          </p>
        </div>

        <div className="flex gap-4">
          <Link href={`/products/${product.id}/edit`}>
            <Button className="bg-transparent border border-(--border) hover:text-(--primary) hover:bg-transparent hover:border-(--primary)">
              <Pencil color="orange" className="w-5 h-5" /> Modifier
            </Button>
          </Link>

          <Button className="border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.28)] hover:border-(--error) bg-transparent text-(--error)">
            <Trash2 color="gray" className="w-5 h-5" /> Supprimer
          </Button>
        </div>
      </header>

      {/* SECTION IMG DESCRIPTION PRODUIT */}
      <div className="bg-(--bg-card) p-6 rounded-lg border border-(--border)">
        <div className="flex gap-6 p-6">
          <div
            className="w-50 h-50 rounded-2xl flex items-center justify-center md:text-5xl lg:text-9xl"
            style={{
              backgroundColor: `${categoryColor}20`,
              border: `1px solid ${categoryColor}30`,
            }}
          >
            {product.category_icon}
          </div>
          <div className="flex flex-col gap-6 flex-1">
            <h2 className="text-3xl font-black">{product.name}</h2>
            <div className="text-sm opacity-55">
              {product.sku} - <span>Code-barres :{"  "}</span>
              {product.barcode}
            </div>
            <div className="flex gap-2">
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
            <div className="text-md font-medium opacity-60">
              {product.description}
            </div>
            <div className="flex gap-2 mt-2">
              {product?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-[rgba(255,255,255,0.05)] border border-(--border) text-(--text-secondary)"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTIONS GRID COLUMN RIGHT AND LEFT*/}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* COLUMN LEFT */}
        <div className="space-y-6">
          {/* 3 CARTES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 px-4 py-6 bg-(--bg-card) rounded-xl border border-(--border)">
              <span className="text-(--success) font-bold text-3xl">
                {product.quantity}
              </span>
              <span className="text-sm opacity-60">En stock</span>
            </div>

            <div className="flex flex-col items-center gap-2 px-4 py-6 bg-(--bg-card) rounded-xl border border-(--border)">
              <span className="text-(--primary) font-bold text-3xl">
                {stockValue} €
              </span>
              <span className="text-sm opacity-60">Valeur stock</span>
            </div>

            <div className="flex flex-col items-center gap-2 px-4 py-6 bg-(--bg-card) rounded-xl border border-(--border)">
              <span className="font-bold text-3xl">0</span>
              <span className="text-sm opacity-60">Vendus ce mois</span>
            </div>
          </div>

          {/* SECTION INFOS DETAIL */}
          <div className="bg-(--bg-card) p-6 rounded-xl border border-(--border)">
            <h3 className="border-b border-(--border) text-xl pb-2 mb-4">
              Informations détaillées
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Prix d&apos;achat</span>
                <span>{product.purchase_price} €</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Prix de vente</span>
                <span>{product.selling_price} €</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Marge</span>
                <span>
                  {margin.toFixed(2)} € ({marginPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">TVA</span>
                <span>{product.tax_rate} %</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Seuil d&apos;alerte</span>
                <span>{product.alert_threshold}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Unité</span>
                <span>{product.unit}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Poids</span>
                <span>{product.weight}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Emplacement</span>
                <span>{product.location}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Fournisseur</span>
                <span>{product.supplier_name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-60">Crée le</span>
                <span>
                  {new Date(product.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-(--bg-card) p-6 rounded-xl">
            <div className="border-b border-(--border) flex justify-between items-center mb-4">
              <h3 className="text-xl pb-2">Historique des mouvements</h3>
              <Link href="#">
                <button className="text-(--primary) cursor-pointer">
                  Voir tout →
                </button>
              </Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Raison</th>
                  <th>Par</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMN RIGHT */}
        <div className="space-y-6">
          <div className="bg-(--bg-card) border border-(--border) p-6 rounded-xl">
            <h3 className="text-xl pb-2 border-b border-(--border) mb-5">
              Actions rapides
            </h3>
            <div className="flex flex-col gap-4">
              <Button className="flex items-center gap-4 border border-(--border) bg-[rgba(255,255,255,0.02)] rounded-xl px-3.5 py-5 text-left hover:border-(--success) hover:bg-[rgba(16,185,129,0.05)]">
                <div className="flex items-center justify-center w-10 h-10 text-2xl ml-2 bg-[rgba(16,185,129,0.1)] rounded-xl p-1">
                  <Inbox color="green" />
                </div>
                <div className="flex flex-col gap-1">
                  <span>Entrée de stock</span>
                  <span className="opacity-50 text-[12px]">
                    Ajouter des unités
                  </span>
                </div>
              </Button>
              <Button className="flex items-center gap-4 border border-(--border) bg-[rgba(255,255,255,0.02)] rounded-xl px-3.5 py-5 text-left hover:border-(--error) hover:bg-[rgba(239,68,68,0.05)]">
                <div className="flex items-center justify-center w-10 h-10 text-2xl ml-2  bg-[rgba(239,68,68,0.1)] rounded-xl p-1">
                  <Inbox color="red" />
                </div>
                <div className="flex flex-col gap-1">
                  <span>Sortie de stock</span>
                  <span className="opacity-50 text-[12px]">
                    Retirer des unités
                  </span>
                </div>
              </Button>
            </div>
          </div>
          {/* SECTION FOURNISSEUR */}
          <div className="bg-(--bg-card) border border-(--border) p-6 rounded-xl">
            <h3 className="text-xl pb-2 border-b border-(--border) mb-5">
              Fournisseur
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-50">Nom</span>
                <span className="text-lg font-bold">
                  {product.supplier_name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-50">Contact</span>
                <span className="text-lg font-bold">
                  {product.supplier_contact}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-50">Email</span>
                <span className="text-lg font-bold text-(--primary)">
                  {product.supplier_email}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-50">Téléphone</span>
                <span className="text-lg font-bold">
                  {product.supplier_phone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
