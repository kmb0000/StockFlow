"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { getAll } from "@/services/categories.service";
import { getAll as getAllSuppliers } from "@/services/suppliers.service";
import { create } from "@/services/products.service";
import { Camera, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// On définit les types de status autorisés
type ProductStatus = "active" | "draft" | "archived";

export default function AddProduct() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, supps] = await Promise.all([getAll(), getAllSuppliers()]);
        setCategories(cats);
        setSuppliers(supps);
      } catch (err) {
        console.error(
          `[AddProduct] Erreur fetch getAll[categories] getAllSuppliers :`,
          err,
        );
      }
    }
    fetchData();
  }, []);

  // Correction ici : on type le state pour que status soit reconnu comme ProductStatus
  const [form, setForm] = useState({
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
    status: "active" as ProductStatus, // On force le type ici
    is_available: true,
  });

  // Mise à jour de la fonction pour accepter le type ProductStatus
  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await create({
        name: form.name,
        sku: form.sku,
        barcode: form.barcode,
        description: form.description,
        purchase_price:
          form.purchase_price !== "" ? Number(form.purchase_price) : 0,
        selling_price:
          form.selling_price !== "" ? Number(form.selling_price) : 0,
        quantity: form.quantity !== "" ? Number(form.quantity) : 0,
        // Si vide, undefined pour laisser la BDD mettre le seuil par défaut (ex: 10)
        alert_threshold:
          form.alert_threshold !== ""
            ? Number(form.alert_threshold)
            : undefined,
        weight: form.weight !== "" ? Number(form.weight) : undefined,
        unit: form.unit,
        category_id: form.category_id,
        supplier_id: form.supplier_id,
        location: form.location,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status, // Maintenant TS est content car form.status est "ProductStatus"
        is_available: form.is_available,
      });
      router.push("/products");
    } catch (err) {
      console.error(
        `[AddProduct] Erreur création produit (SKU: ${form.sku}) :`,
        err,
      );
      setError(
        "Erreur lors de la création du produit. Vérifiez les champs obligatoires et le SKU.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-1 lg:p-2 space-y-8">
      <header className="flex flex-col gap-4 mb-5">
        <nav className="flex gap-2 opacity-50 text-sm">
          <Link href="/dashboard" className="hover:text-(--primary)">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-(--primary)">
            Produits
          </Link>
          <span>/</span>
          <span>Nouveau produit</span>
        </nav>
        <h1 className="text-3xl font-black">Ajouter un produit</h1>
        <p className="opacity-50">
          Créez un nouveau produit dans votre inventaire
        </p>
      </header>

      <form className="mt-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Informations générales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <Input
                    label={"Nom du produit *"}
                    placeholder="Ex: Laptop Dell XPS 15"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>

                <Input
                  label={"SKU *"}
                  placeholder="SKU-2024-XXX"
                  value={form.sku}
                  onChange={(e) => updateForm("sku", e.target.value)}
                  required
                />
                <Input
                  label={"Code-barres *"}
                  placeholder="123456789012"
                  value={form.barcode}
                  onChange={(e) => updateForm("barcode", e.target.value)}
                  required
                />

                <div className="col-span-2">
                  <Textarea
                    label={"Description"}
                    placeholder="Description détaillée du produit..."
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Prix et stock
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label={"Prix d'achat (€) *"}
                  type="number"
                  step="0.01"
                  value={form.purchase_price}
                  onChange={(e) => updateForm("purchase_price", e.target.value)}
                  required
                />
                <Input
                  label={"Prix de vente (€) *"}
                  type="number"
                  step="0.01"
                  value={form.selling_price}
                  onChange={(e) => updateForm("selling_price", e.target.value)}
                  required
                />

                <Input
                  label={"Quantité initiale *"}
                  type="number"
                  value={form.quantity}
                  onChange={(e) => updateForm("quantity", e.target.value)}
                  required
                />
                <Input
                  label={"Seuil alerte stock"}
                  type="number"
                  placeholder="Défaut: 10"
                  value={form.alert_threshold}
                  onChange={(e) =>
                    updateForm("alert_threshold", e.target.value)
                  }
                />

                <Select
                  label={"Unité *"}
                  value={form.unit}
                  onChange={(e) => updateForm("unit", e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option>Pièce</option>
                  <option>Carton</option>
                  <option>Pack</option>
                  <option>Kg</option>
                  <option>Litre</option>
                </Select>
                <Input
                  label={"Poids (kg)"}
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => updateForm("weight", e.target.value)}
                />
              </div>
            </div>

            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Organisation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Catégorie *"
                  value={form.category_id}
                  onChange={(e) => updateForm("category_id", e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Fournisseur *"
                  value={form.supplier_id}
                  onChange={(e) => updateForm("supplier_id", e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </Select>

                <div className="col-span-2">
                  <Input
                    label={"Emplacement"}
                    placeholder="Ex: Entrepôt A - Allée 3 - Etagère 2"
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label={"Tags"}
                    placeholder="Ex: nouveau, promotion, populaire"
                    className="mb-2"
                    value={form.tags}
                    onChange={(e) => updateForm("tags", e.target.value)}
                  />
                  <span className="text-sm opacity-50">
                    Séparés par des virgules
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6 flex flex-col gap-2">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Image du produit
              </h3>
              <div className="bg-[rgba(255,255,255,0.07)] border-dashed border-2 border-(--border) flex flex-col justify-center items-center px-8 py-14 rounded-xl cursor-pointer hover:border-(--primary) transition-all duration-200 hover:bg-[rgba(0,102,255,0.05)]">
                <div className="mb-3">
                  <Camera className="w-20 h-20" color="blue" />
                </div>
                <div className="flex flex-col justify-center items-center text-center">
                  <span className="text-(--text-primary)">
                    <strong className="text-(--primary)">
                      Cliquez pour uploader
                    </strong>{" "}
                    ou glissez-déposez
                  </span>
                  <br />
                  <small className="opacity-60">
                    PNG, JPG jusqu&apos;à 5MB
                  </small>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(0,102,255,0.05)] border border-[rgba(0,102,255,0.2)] rounded-xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--primary) mb-4">
                <Lightbulb className="w-4 h-4" color="yellow" />
                Conseils
              </div>
              <ul className="text-sm text-(--text-secondary) space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-(--primary)">•</span>
                  Utilisez des images haute qualité
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-(--primary)">•</span>
                  Le SKU doit être unique
                </li>
              </ul>
            </div>

            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Statut
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <Select
                  label={"Statut du produit"}
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option value="active">Actif</option>
                  <option value="draft">Brouillon</option>
                  <option value="archived">Archivé</option>
                </Select>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="available"
                    className="w-4 h-4 accent-(--primary) cursor-pointer"
                    checked={form.is_available}
                    onChange={(e) =>
                      updateForm("is_available", e.target.checked)
                    }
                  />
                  <label htmlFor="available" className="text-sm cursor-pointer">
                    Disponible à la vente
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-[#EF4444] text-sm mt-4 font-medium">{error}</p>
        )}
        <div className="flex justify-end gap-4 mt-8 pb-10">
          <Link href="/products">
            <Button variant="secondary" type="button">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
