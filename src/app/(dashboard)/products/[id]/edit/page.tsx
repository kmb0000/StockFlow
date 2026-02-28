"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { getAll } from "@/services/categories.service";
import { getAll as getAllSuppliers } from "@/services/suppliers.service";
import { getById, update } from "@/services/products.service";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";

// Types stricts
type ProductStatus = "active" | "draft" | "archived";

interface ProductForm {
  name: string;
  sku: string;
  barcode: string;
  description: string;
  purchase_price: string;
  selling_price: string;
  quantity: string;
  alert_threshold: string;
  unit: string;
  weight: string;
  category_id: string;
  supplier_id: string;
  location: string;
  tags: string;
  status: ProductStatus;
  is_available: boolean;
}

export default function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [form, setForm] = useState<ProductForm>({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    purchase_price: "",
    selling_price: "",
    quantity: "",
    alert_threshold: "",
    unit: "",
    weight: "",
    category_id: "",
    supplier_id: "",
    location: "",
    tags: "",
    status: "active",
    is_available: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, supps, product] = await Promise.all([
          getAll(),
          getAllSuppliers(),
          getById(id),
        ]);
        setCategories(cats);
        setSuppliers(supps);

        setForm({
          name: product.name,
          sku: product.sku,
          barcode: product.barcode ?? "",
          description: product.description ?? "",
          purchase_price: String(product.purchase_price),
          selling_price: String(product.selling_price),
          quantity: String(product.quantity),
          alert_threshold: String(product.alert_threshold ?? ""),
          unit: product.unit,
          weight: String(product.weight ?? ""),
          category_id: product.category_id ?? "",
          supplier_id: product.supplier_id ?? "",
          location: product.location ?? "",
          tags: product.tags?.join(", ") ?? "",
          status: (product.status as ProductStatus) || "active",
          is_available: !!product.is_available,
        });
      } catch (err) {
        console.error(`[EditProduct] Erreur fetch :`, err);
        setError("Erreur de chargement.");
      }
    }
    fetchData();
  }, [id]);

  function updateForm(field: keyof ProductForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await update(id, {
        ...form,
        purchase_price: Number(form.purchase_price),
        selling_price: Number(form.selling_price),
        quantity: Number(form.quantity),
        alert_threshold: Number(form.alert_threshold),
        weight: Number(form.weight),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.push("/products");
    } catch (err) {
      console.error(`[EditProduct] Erreur update :`, err);
      setError("Erreur lors de la modification.");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-(--bg-body)">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
        <header className="mb-10 space-y-4">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--primary) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour aux produits
          </Link>
          <h1 className="text-3xl font-black">Modifier le produit</h1>
        </header>

        {/* Le padding-bottom (pb-32) permet de ne pas avoir le formulaire caché par la barre sticky */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32"
        >
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-(--bg-card) border border-(--border) rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold border-b border-(--border) pb-3">
                Informations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="Nom du produit *"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="SKU *"
                  value={form.sku}
                  onChange={(e) => updateForm("sku", e.target.value)}
                  required
                />
                <Input
                  label="Code-barres"
                  value={form.barcode}
                  onChange={(e) => updateForm("barcode", e.target.value)}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    rows={5}
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="bg-(--bg-card) border border-(--border) rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold border-b border-(--border) pb-3">
                Prix et Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Input
                  label="Prix achat (€)"
                  type="number"
                  value={form.purchase_price}
                  onChange={(e) => updateForm("purchase_price", e.target.value)}
                />
                <Input
                  label="Prix vente (€)"
                  type="number"
                  value={form.selling_price}
                  onChange={(e) => updateForm("selling_price", e.target.value)}
                />
                <Input
                  label="Quantité"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => updateForm("quantity", e.target.value)}
                />
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-(--bg-card) border border-(--border) rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold border-b border-(--border) pb-3">
                Statut
              </h3>
              <Select
                label="État"
                value={form.status}
                onChange={(e) =>
                  updateForm("status", e.target.value as ProductStatus)
                }
              >
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivé</option>
              </Select>
            </section>

            <section className="bg-(--bg-card) border border-(--border) rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold border-b border-(--border) pb-3">
                Catégorie
              </h3>
              <Select
                label="Choisir"
                value={form.category_id}
                onChange={(e) => updateForm("category_id", e.target.value)}
              >
                <option value="">Sélectionner...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </section>
          </div>
        </form>
      </div>

      {/* BARRE DE BOUTONS STICKY  */}
      <footer className="sticky bottom-0 w-full bg-(--bg-card) border-t border-(--border) p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            {error && (
              <span className="text-[#EF4444] font-medium">⚠️ {error}</span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/products" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full" type="button">
                Annuler
              </Button>
            </Link>
            {/* On utilise l'id du form pour soumettre même si le bouton est en dehors du <form> */}
            <Button
              type="submit"
              form="product-form"
              className="flex-1 sm:flex-none"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
