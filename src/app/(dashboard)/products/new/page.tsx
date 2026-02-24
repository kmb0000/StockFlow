import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { Camera, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function AddProduct() {
  return (
    <div>
      {/* HEADER */}
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

      <form className="mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 bg-(--card)">
          {/* LEFT COLUMN */}
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
                  />
                </div>

                <Input label={"SKU *"} placeholder="SKU-2024-XXX" />
                <Input label={"Code-barres *"} placeholder="123456789012" />

                <div className="col-span-2">
                  <Textarea
                    label={"Description"}
                    placeholder="Description détaillée du produit..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION PRIX ET STOCK */}
            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Prix et stock
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label={"Prix d'achat (€) *"} />
                <Input label={"Prix de vente (€) *"} />

                <Input label={"Quantité initiale *"} />
                <Input label={"Seuil alerte stock"} />

                <Input label={"Unité *"} />
                <Input label={"Poids (kg)"} />
              </div>
            </div>

            {/* SECTION ORGANISATION */}
            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Organisation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select label={"Catégorie *"}>
                  <option value="">Sélectionner...</option>
                  <option>Audio</option>
                  <option>Informatique</option>
                  <option>Accessoires</option>
                  <option>Electronique</option>
                </Select>
                <Select label={"Fournisseur *"}>
                  <option value="">Sélectionner...</option>
                  <option>TechSupply Co.</option>
                  <option>ElectroWare</option>
                  <option>GlobalParts</option>
                </Select>

                <div className="col-span-2">
                  <Input
                    label={"Emplacement"}
                    placeholder="Ex: Entrepôt A - Allée 3 - Etagère 2"
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label={"Tags"}
                    placeholder="Ex: nouveau, promotion, populaire"
                    className="mb-2"
                  />
                  <span className="text-sm opacity-50">
                    Séparés par des virgules
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-(--card) border border-(--border) rounded-xl p-6 flex flex-col gap-2">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Image du produit
              </h3>
              <div className="bg-[rgba(255,255,255,0.07)] border-dashed border-2 border-(--border) flex flex-col justify-center items-center px-8 py-14 rounded-xl cursor-pointer hover:border-(--primary) transition-all duration-200 hover:bg-[rgba(0,102,255,0.05)]">
                <div className="mb-3">
                  <Camera className="w-20 h-20" color="blue" />
                </div>
                <div className="flex flex-col justify-center items-center">
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

            {/* SECTION CONSEILS */}
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
                  Remplissez tous les champs obligatoires
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-(--primary)">•</span>
                  Le SKU doit être unique
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-(--primary)">•</span>
                  Définissez un seuil d&apos;alerte adapté
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-(--primary)">•</span>
                  Vérifiez le prix avant validation
                </li>
              </ul>
            </div>

            {/* SECTION STATUT */}

            <div className="bg-(--bg-card) border border-(--border) rounded-xl p-6">
              <h3 className="border-b border-(--border) pb-3 mb-5 text-lg font-bold">
                Statut
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <Select label={"Statut du produit"}>
                    <option value="">Actif</option>
                    <option>Brouillon</option>
                    <option>Archivé</option>
                  </Select>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="available"
                    className="w-4 h-4 accent-(--primary) cursor-pointer"
                  />
                  <label htmlFor="available" className="text-sm cursor-pointer">
                    Disponible à la vente
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <Link href="/products">
            <Button variant="secondary">Annuler</Button>
          </Link>
          <Button type="submit">Créer le produit</Button>
        </div>
      </form>
    </div>
  );
}
