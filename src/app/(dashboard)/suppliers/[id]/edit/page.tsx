"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { getById, update } from "@/services/suppliers.service";
import { Lightbulb, Loader2, ArrowLeft, Save, X, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function EditSupplier({
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
    email: "",
    phone: "",
    contact_person: "",
    address: "",
    city: "",
    postal_code: "",
    country: "France",
    website: "",
    notes: "",
    is_active: true,
  });

  // --- RÉCUPÉRATION DES DONNÉES ---
  useEffect(() => {
    async function fetchSupplier() {
      try {
        setLoading(true);
        const s = await getById(id);

        // On s'assure qu'aucune valeur n'est 'null' pour les inputs React
        setForm({
          name: s.name || "",
          email: s.email ?? "",
          phone: s.phone ?? "",
          contact_person: s.contact_person ?? "",
          address: s.address ?? "",
          city: s.city ?? "",
          postal_code: s.postal_code ?? "",
          country: s.country ?? "France",
          website: s.website ?? "",
          notes: s.notes ?? "",
          is_active: s.is_active ?? true,
        });
      } catch (err) {
        setError("Impossible de charger les données du fournisseur.");
      } finally {
        setLoading(false);
      }
    }
    fetchSupplier();
  }, [id]);

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // --- SOUMISSION ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom du fournisseur est obligatoire.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await update(
        {
          ...form,
          // On nettoie les chaînes vides pour ne pas polluer la DB
          email: form.email || undefined,
          phone: form.phone || undefined,
          contact_person: form.contact_person || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          postal_code: form.postal_code || undefined,
          website: form.website || undefined,
          notes: form.notes || undefined,
        },
        id,
      );
      router.push(`/suppliers/${id}`); // On redirige vers le détail pour voir le résultat
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue lors de l'enregistrement.");
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-(--primary)" />
        <p className="text-(--text-secondary)">Chargement du formulaire...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-xs font-medium text-(--text-secondary) uppercase tracking-wider mb-2">
          <Link href="/suppliers" className="hover:text-(--primary)">
            Fournisseurs
          </Link>
          <span>/</span>
          <span className="text-(--text-primary)">Modifier {form.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic text-(--primary)">
              Édition Partenaire
            </h1>
            <p className="text-(--text-secondary) text-sm mt-1">
              Mise à jour des informations contractuelles et de contact.
            </p>
          </div>
          <Link href={`/suppliers/${id}`}>
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour au profil
            </Button>
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* COLONNE GAUCHE : FORMULAIRE PRINCIPAL */}
          <div className="space-y-6">
            {/* SECTION IDENTITÉ */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 italic uppercase">
                <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                Identité & Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Raison Sociale *"
                    placeholder="Nom officiel de l'entreprise"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Référent de contact"
                  placeholder="Nom du gestionnaire de compte"
                  value={form.contact_person}
                  onChange={(e) => updateForm("contact_person", e.target.value)}
                />
                <Input
                  label="Email professionnel"
                  type="email"
                  placeholder="exemple@fournisseur.com"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                />
                <Input
                  label="Ligne téléphonique"
                  placeholder="+33..."
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                />
                <Input
                  label="Site Web"
                  placeholder="www.entreprise.com"
                  value={form.website}
                  onChange={(e) => updateForm("website", e.target.value)}
                />
              </div>
            </div>

            {/* SECTION LOGISTIQUE */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 italic uppercase">
                <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                Siège & Logistique
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Adresse postale"
                    placeholder="Numéro et nom de rue"
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                  />
                </div>
                <Input
                  label="Ville"
                  placeholder="Ex: Lyon"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                />
                <Input
                  label="Code Postal"
                  placeholder="Ex: 69000"
                  value={form.postal_code}
                  onChange={(e) => updateForm("postal_code", e.target.value)}
                />
                <div className="md:col-span-2">
                  <Select
                    label="Pays"
                    value={form.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Espagne">Espagne</option>
                    <option value="Italie">Italie</option>
                    <option value="Chine">Chine</option>
                    <option value="États-Unis">États-Unis</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION NOTES */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 italic uppercase">
                Informations Libres
              </h3>
              <Textarea
                label="Notes de gestion"
                placeholder="Spécificités de livraison, délais habituels, remises négociées..."
                rows={5}
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
              />
            </div>
          </div>

          {/* COLONNE DROITE : STATUT & PREVIEW */}
          <div className="space-y-6">
            {/* STATUT ACTIVATION */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 italic uppercase text-sm tracking-widest">
                Disponibilité
              </h3>
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  form.is_active
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
                onClick={() => updateForm("is_active", !form.is_active)}
              >
                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${form.is_active ? "bg-green-500" : "bg-gray-400"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? "left-5" : "left-1"}`}
                  />
                </div>
                <span className="font-bold text-sm">
                  {form.is_active ? "Partenaire Actif" : "Partenaire Inactif"}
                </span>
              </div>
              <p className="text-[10px] text-(--text-secondary) mt-3 leading-tight uppercase">
                Désactiver un partenaire empêchera la création de nouveaux
                produits liés.
              </p>
            </div>

            {/* APERÇU DE LA CARTE */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm sticky top-8">
              <h3 className="font-bold mb-4 italic uppercase text-sm tracking-widest">
                Rendu Visuel
              </h3>
              <div className="bg-(--bg-body) border border-(--border) rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-(--primary) flex items-center justify-center text-xl font-black text-white">
                    {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate text-sm">
                      {form.name || "Nouveau Fournisseur"}
                    </p>
                    <p className="text-xs text-(--text-secondary) truncate">
                      {form.city || "Ville non définie"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-(--border)">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Globe className="w-3 h-3 text-(--primary)" />
                    <span className="truncate opacity-70">
                      {form.website || "Pas de site web"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONSEILS */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-tighter">
                  <Lightbulb className="w-4 h-4" /> Rappels Utiles
                </div>
                <ul className="text-[11px] text-(--text-secondary) space-y-2">
                  <li className="flex gap-2">
                    <span>•</span> Privilégiez l&apos;email générique du service
                    commercial.
                  </li>
                  <li className="flex gap-2">
                    <span>•</span> Vérifiez le format du téléphone
                    international.
                  </li>
                  <li className="flex gap-2">
                    <span>•</span> Un partenaire inactif conserve son
                    historique.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS FINALES */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-(--border)">
          {error && (
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm animate-shake">
              <X className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="flex gap-4 w-full md:w-auto ml-auto">
            <Link href={`/suppliers/${id}`} className="flex-1 md:flex-none">
              <Button type="button" variant="secondary" className="w-full">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none gap-2 bg-(--primary) hover:opacity-90 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
