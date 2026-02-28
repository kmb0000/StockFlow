"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { create } from "@/services/suppliers.service";
import {
  Lightbulb,
  Loader2,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddSupplier() {
  const router = useRouter();
  const [error, setError] = useState("");
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
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setError("Le nom du fournisseur est obligatoire.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // On crée un objet propre en filtrant les chaînes vides
      // On type explicitement l'objet pour correspondre à ce que 'create' attend
      const payload: Partial<typeof form> = {};

      (Object.keys(form) as Array<keyof typeof form>).forEach((key) => {
        const value = form[key].trim();
        if (value) {
          payload[key] = value;
        }
      });

      // Ici, on passe l'objet casté vers le type attendu par le service
      await create(payload as Parameters<typeof create>[0]);

      router.push("/suppliers");
    } catch (err) {
      setError("Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-350 mx-auto space-y-8">
      {/* HEADER AVEC FIL D'ARIANE */}
      <header className="space-y-4">
        <nav className="flex items-center gap-2 text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
          <Link
            href="/suppliers"
            className="hover:text-(--primary) flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Fournisseurs
          </Link>
          <span>/</span>
          <span className="text-(--text-primary)">Nouveau partenaire</span>
        </nav>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Ajouter un fournisseur
          </h1>
          <p className="text-(--text-secondary)">
            Complétez les informations pour référencer un nouveau prestataire.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8"
      >
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="space-y-6">
          {/* SECTION IDENTITÉ */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-(--primary) rounded-full"></span>
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nom de l'entreprise *"
                  placeholder="Ex: TechDistrib SARL"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                />
              </div>
              <Input
                label="Personne de contact"
                placeholder="Ex: Jean Dupont"
                value={form.contact_person}
                onChange={(e) => updateForm("contact_person", e.target.value)}
              />
              <Input
                label="Email professionnel"
                type="email"
                placeholder="contact@fournisseur.com"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
              />
              <Input
                label="Téléphone"
                placeholder="+33 1 23 45 67 89"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
              />
              <Input
                label="Site internet"
                placeholder="www.fournisseur.com"
                value={form.website}
                onChange={(e) => updateForm("website", e.target.value)}
              />
            </div>
          </div>

          {/* SECTION LOCALISATION */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-(--primary) rounded-full"></span>
              Siège social
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Adresse complète"
                  placeholder="Ex: 12 rue de la Paix"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                />
              </div>
              <Input
                label="Ville"
                placeholder="Ex: Paris"
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
              />
              <Input
                label="Code postal"
                placeholder="75001"
                value={form.postal_code}
                onChange={(e) => updateForm("postal_code", e.target.value)}
              />
              <div className="md:col-span-2">
                <Select
                  label="Pays de résidence"
                  value={form.country}
                  onChange={(e) => updateForm("country", e.target.value)}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                  <option value="Autre">Autre</option>
                </Select>
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-(--primary) rounded-full"></span>
              Notes de collaboration
            </h3>
            <Textarea
              placeholder="Spécificités logistiques, délais de paiement habituels, remises négociées..."
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              className="min-h-30"
              label={""}
            />
          </div>
        </div>

        {/* COLONNE DROITE : PREVIEW & TIPS */}
        <aside className="space-y-6">
          <div className="sticky top-8 space-y-6">
            {/* CARTE PREVIEW DYNAMIQUE */}
            <div className="bg-(--bg-card) border-2 border-(--primary-alpha) rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="w-20 h-20 rotate-12" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-(--primary) flex items-center justify-center text-3xl font-black text-white shadow-lg">
                  {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h4 className="text-xl font-black truncate max-w-45">
                    {form.name || "Nouveau Partenaire"}
                  </h4>
                  <p className="text-xs text-(--text-secondary) font-medium">
                    {form.contact_person || "Contact à définir"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-(--border) pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-(--primary)" />
                  <span
                    className={
                      form.email
                        ? "text-(--text-primary)"
                        : "text-(--text-secondary) italic"
                    }
                  >
                    {form.email || "Non renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-(--primary)" />
                  <span
                    className={
                      form.phone
                        ? "text-(--text-primary)"
                        : "text-(--text-secondary) italic"
                    }
                  >
                    {form.phone || "Non renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-(--primary)" />
                  <span
                    className={
                      form.city
                        ? "text-(--text-primary)"
                        : "text-(--text-secondary) italic"
                    }
                  >
                    {form.city
                      ? `${form.city} (${form.country})`
                      : "Localisation inconnue"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <div className="flex-1 bg-(--bg-body) p-2 rounded-lg text-center border border-(--border)">
                  <span className="block text-lg font-bold">0</span>
                  <span className="text-[10px] text-(--text-secondary) uppercase">
                    Produits
                  </span>
                </div>
                <div className="flex-1 bg-(--success-alpha)/10 p-2 rounded-lg text-center border border-(--success-alpha)">
                  <span className="block text-lg font-bold text-(--success)">
                    Actif
                  </span>
                  <span className="text-[10px] text-(--text-secondary) uppercase">
                    Statut
                  </span>
                </div>
              </div>
            </div>

            {/* TIPS CARD */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-500 font-bold mb-4">
                <Lightbulb className="w-5 h-5" />
                <span>Conseils de gestion</span>
              </div>
              <ul className="space-y-4 text-sm text-(--text-secondary)">
                <li className="flex gap-2 italic">
                  <span>•</span>
                  <span>
                    Un contact direct (nom/prénom) accélère le traitement des
                    litiges de livraison.
                  </span>
                </li>
                <li className="flex gap-2 italic">
                  <span>•</span>
                  <span>
                    L&apos;adresse mail servira par la suite pour l&apos;envoi
                    automatique de bons de commande.
                  </span>
                </li>
              </ul>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">
              {error && (
                <p className="text-(--error) text-sm font-medium bg-(--error-alpha)/10 p-3 rounded-lg border border-(--error-alpha)">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-lg shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Création...
                  </>
                ) : (
                  "Valider le fournisseur"
                )}
              </Button>
              <Link href="/suppliers" className="w-full">
                <Button variant="secondary" className="w-full" type="button">
                  Annuler
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
