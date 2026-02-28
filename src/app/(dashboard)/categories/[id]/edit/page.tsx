"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { getById, update } from "@/services/categories.service";
import { Lightbulb, ChevronLeft, Save, Palette } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const SUGGESTED_ICONS = [
  "💻",
  "📱",
  "🖥️",
  "⌨️",
  "🖱️",
  "🎧",
  "📦",
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

export default function EditCategory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#0066FF",
    icon: "📦",
  });

  useEffect(() => {
    async function fetchCategory() {
      try {
        const category = await getById(id);
        setForm({
          name: category.name,
          description: category.description ?? "",
          color: category.color ?? "#0066FF",
          icon: category.icon ?? "📦",
        });
      } catch (err) {
        console.error(`[EditCategory] Erreur fetch :`, err);
        setError("Impossible de récupérer les données de la catégorie.");
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [id]);

  function updateForm(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await update(
        {
          name: form.name,
          description: form.description || undefined,
          color: form.color,
          icon: form.icon,
        },
        id,
      );
      router.push("/categories");
      router.refresh(); // Pour forcer la mise à jour des données côté serveur
    } catch (err) {
      console.error(`[EditCategory] Erreur update :`, err);
      setError("Erreur lors de la mise à jour. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-8">
        <div className="h-4 w-32 bg-(--border) rounded" />
        <div className="h-10 w-64 bg-(--border) rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-(--bg-card) rounded-2xl border border-(--border)" />
          <div className="h-96 bg-(--bg-card) rounded-2xl border border-(--border)" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-(--bg-body)">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
        {/* HEADER */}
        <header className="mb-10 space-y-4">
          <Link
            href={`/categories/${id}`}
            className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--primary) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Annuler et retourner au détail
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Modifier la catégorie
            </h1>
            <p className="text-(--text-secondary)">
              Mettez à jour l&apos;identité visuelle et les infos
            </p>
          </div>
        </header>

        <form
          id="edit-category-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32"
        >
          {/* GAUCHE - ÉDITION */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold border-b border-(--border) pb-4">
                Configuration
              </h3>
              <div className="space-y-6">
                <Input
                  label="Nom de la catégorie *"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                />
                <Textarea
                  label="Description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </div>
            </section>

            <section className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Palette className="w-5 h-5 text-(--primary)" />
                  <h3>Style & Icône</h3>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium opacity-70">
                    Emoji
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => updateForm("icon", icon)}
                        className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${
                          form.icon === icon
                            ? "border-(--primary) bg-(--primary-alpha) scale-110"
                            : "border-(--border) hover:border-(--text-secondary)"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-(--border)">
                  <label className="text-sm font-medium opacity-70">
                    Couleur personnalisée
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl border border-(--border) overflow-hidden group">
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
                    <span className="ml-2 font-mono text-xs opacity-50">
                      {form.color}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* DROITE - APERÇU */}
          <div className="space-y-6">
            <div className="sticky top-8 space-y-6">
              <section className="bg-(--bg-card) border border-(--border) rounded-2xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-6">
                  Rendu final
                </h3>
                <div className="border border-(--border) rounded-2xl p-6 bg-(--bg-dark)/50">
                  <div
                    className="w-16 h-16 text-4xl flex items-center justify-center rounded-2xl mb-6 shadow-lg"
                    style={{
                      backgroundColor: `${form.color}15`,
                      border: `1px solid ${form.color}40`,
                      color: form.color,
                    }}
                  >
                    {form.icon}
                  </div>
                  <h4 className="text-xl font-black truncate">
                    {form.name || "Nom vide"}
                  </h4>
                  <p className="text-sm text-(--text-secondary) mt-2 line-clamp-3 leading-relaxed">
                    {form.description || "Aucune description saisie."}
                  </p>
                </div>
              </section>

              <div className="bg-(--primary-alpha) border border-(--primary-dark)/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-(--primary) font-bold mb-3 text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>Le saviez-vous ?</span>
                </div>
                <p className="text-xs text-(--text-primary)/70 leading-relaxed">
                  Modifier la couleur ou l&apos;icône mettra à jour
                  instantanément tous les graphiques du tableau de bord
                  utilisant cette catégorie.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER ACTION */}
      <footer className="sticky bottom-0 w-full bg-(--bg-card)/80 backdrop-blur-md border-t border-(--border) p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            {error && (
              <span className="text-(--error) font-medium italic animate-pulse">
                ⚠️ {error}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/categories" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full" type="button">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              form="edit-category-form"
              className="flex-1 sm:flex-none shadow-(--primary-alpha)"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Enregistrement..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
