"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { create } from "@/services/categories.service";
import { Lightbulb, ChevronLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTED_ICONS = [
  "📦",
  "💻",
  "📱",
  "🖥️",
  "⌨️",
  "🖱️",
  "🎧",
  "🔌",
  "💡",
  "🔧",
  "🛒",
  "📚",
  "🎮",
  "🏷️",
  "⚙️",
  "🧰",
];

const SUGGESTED_COLORS = [
  "#0066FF",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

export default function AddCategory() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#0066FF",
    icon: "📦",
  });

  // Typage strict pour éviter les erreurs
  function updateForm(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return setError("Le nom est obligatoire");

    setError("");
    setIsSubmitting(true);

    try {
      await create({
        name: form.name,
        description: form.description || undefined,
        color: form.color,
        icon: form.icon,
      });
      router.push("/categories");
    } catch (err) {
      console.error(`[AddCategory] Erreur create :`, err);
      setError("Erreur lors de la création de la catégorie");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-(--bg-body)">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
        {/* HEADER AVEC FIL D'ARIANE */}
        <header className="mb-10 space-y-4">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--primary) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour aux catégories
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Nouvelle catégorie
            </h1>
            <p className="text-(--text-secondary)">
              Organisez vos produits avec style
            </p>
          </div>
        </header>

        <form
          id="category-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32"
        >
          {/* COLONNE GAUCHE - CONFIGURATION */}
          <div className="lg:col-span-2 space-y-8">
            {/* INFOS DE BASE */}
            <section className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-lg font-bold border-b border-(--border) pb-4">
                <LayoutGrid className="w-5 h-5 text-(--primary)" />
                <h3>Informations générales</h3>
              </div>
              <div className="space-y-6">
                <Input
                  label="Nom de la catégorie *"
                  placeholder="Ex: Électronique, Mobilier..."
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                />
                <Textarea
                  label="Description"
                  placeholder="À quoi sert cette catégorie ?"
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </div>
            </section>

            {/* PERSONNALISATION VISUELLE */}
            <section className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Identité visuelle</h3>

                {/* ICONES */}
                <div className="space-y-4">
                  <label className="text-sm font-medium opacity-70">
                    Icône représentative
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => updateForm("icon", icon)}
                        className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl border transition-all duration-200 ${
                          form.icon === icon
                            ? "border-(--primary) bg-(--primary-alpha) scale-110 shadow-sm"
                            : "border-(--border) hover:border-(--text-secondary)"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* COULEURS */}
                <div className="space-y-4 pt-4">
                  <label className="text-sm font-medium opacity-70">
                    Couleur thématique
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl border border-(--border) overflow-hidden">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => updateForm("color", e.target.value)}
                        className="absolute -inset-1.25 w-[150%] h-[150%] cursor-pointer"
                      />
                    </div>
                    {SUGGESTED_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateForm("color", color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          form.color === color
                            ? "border-white scale-125 shadow-lg"
                            : "border-transparent hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* COLONNE DROITE - PREVIEW & TIPS */}
          <div className="space-y-6">
            {/* PREVIEW CARD */}
            <div className="sticky top-8 space-y-6">
              <section className="bg-(--bg-card) border border-(--border) rounded-2xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-6">
                  Aperçu en temps réel
                </h3>
                <div className="border border-(--border) rounded-2xl p-6 bg-(--bg-dark)/50">
                  <div
                    className="w-16 h-16 text-4xl flex items-center justify-center rounded-2xl mb-6 shadow-inner"
                    style={{
                      backgroundColor: `${form.color}15`,
                      border: `1px solid ${form.color}30`,
                    }}
                  >
                    {form.icon}
                  </div>
                  <h4 className="text-xl font-black truncate">
                    {form.name || "Ma Catégorie"}
                  </h4>
                  <p className="text-sm text-(--text-secondary) mt-2 line-clamp-2">
                    {form.description || "La description s'affichera ici..."}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-6 mt-6 border-t border-(--border) opacity-40">
                    <div className="text-center">
                      <p className="text-sm font-bold">0</p>
                      <p className="text-[10px] uppercase font-bold">Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">0€</p>
                      <p className="text-[10px] uppercase font-bold">Valeur</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">0</p>
                      <p className="text-[10px] uppercase font-bold">Alertes</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* TIPS */}
              <div className="bg-(--primary-alpha) border border-(--primary-dark)/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-(--primary) font-bold mb-4">
                  <Lightbulb className="w-5 h-5" />
                  <span>Conseils</span>
                </div>
                <ul className="text-xs space-y-3 text-(--text-primary)/80 leading-relaxed">
                  <li>
                    • Utilisez un emoji évocateur pour repérer la catégorie
                    d&apos;un coup d&apos;œil.
                  </li>
                  <li>
                    • Les couleurs chaudes (rouge, orange) sont idéales pour les
                    produits urgents ou soldés.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* BARRE DE BOUTONS STICKY */}
      <footer className="sticky bottom-0 w-full bg-(--bg-card)/80 backdrop-blur-md border-t border-(--border) p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            {error && (
              <span className="text-(--error) font-medium italic">
                ⚠️ {error}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/categories" className="flex-1 sm:flex-none">
              <Button
                variant="secondary"
                className="w-full"
                type="button"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              form="category-form"
              className="flex-1 sm:flex-none shadow-(--primary-alpha)"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création..." : "Créer la catégorie"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
