import { ProductWithRelations } from "@/lib/products/products.types";
import { StockMovementWithRelations } from "@/lib/stock_movements/stock_movements.types";
import { Supplier } from "@/lib/suppliers/suppliers.type";

export function exportProductsToCSV(
  products: ProductWithRelations[],
  filename: string,
): void {
  if (!products.length) {
    console.warn("Aucun produit à exporter");
    return;
  }

  // 1 Définir les en-têtes
  const headers = ["Nom", "SKU", "Catégorie", "Prix", "Quantité", "Status"];

  // 2 Transformer chaque produit en ligne CSV
  const rows = products.map((product) => {
    return (
      [
        product.name,
        product.sku,
        product.category_name ?? "",
        product.selling_price,
        product.quantity,
        product.status,
      ]
        // sécuriser les valeurs (guillemets)
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(";")
    );
  });

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");

  // 3 Créer le Blob
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // 4 Créer un lien temporaire
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Utilitaire interne ──────────────────────────────────────────
function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const csvContent =
    "\uFEFF" +
    [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"),
      ),
    ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Fournisseurs ────────────────────────────────────────────────
export function exportSuppliersToCSV(
  suppliers: Supplier[],
  filename = "fournisseurs",
): void {
  if (!suppliers.length) return;

  const headers = [
    "Nom",
    "Email",
    "Téléphone",
    "Contact",
    "Ville",
    "Pays",
    "Site web",
    "Statut",
  ];

  const rows = suppliers.map((s) => [
    s.name,
    s.email ?? "",
    s.phone ?? "",
    s.contact_person ?? "",
    s.city ?? "",
    s.country,
    s.website ?? "",
    s.is_active ? "Actif" : "Inactif",
  ]);

  downloadCSV(headers, rows, filename);
}

// ── Mouvements de stock ─────────────────────────────────────────
export function exportMovementsToCSV(
  movements: StockMovementWithRelations[],
  filename = "mouvements",
): void {
  if (!movements.length) return;

  const headers = [
    "Date",
    "Produit",
    "SKU",
    "Type",
    "Quantité",
    "Raison",
    "Référence",
    "Prix unitaire",
    "Statut",
    "Créé par",
  ];

  const rows = movements.map((m) => [
    new Date(m.created_at).toLocaleDateString("fr-FR"),
    m.product_name,
    m.product_sku,
    m.type === "IN" ? "Entrée" : "Sortie",
    String(m.quantity),
    m.reason ?? "",
    m.reference ?? "",
    m.unit_price ? String(m.unit_price) : "",
    m.status,
    m.created_by_name,
  ]);

  downloadCSV(headers, rows, filename);
}

// ── Dashboard (résumé global des produits) ──────────────────────
export function exportDashboardToCSV(
  products: ProductWithRelations[],
  filename = "inventaire-global",
): void {
  if (!products.length) return;

  const headers = [
    "Nom",
    "SKU",
    "Catégorie",
    "Fournisseur",
    "Quantité",
    "Prix achat",
    "Prix vente",
    "Valeur stock",
    "Statut",
  ];

  const rows = products.map((p) => [
    p.name,
    p.sku,
    p.category_name ?? "",
    p.supplier_name ?? "",
    String(p.quantity),
    String(p.purchase_price),
    String(p.selling_price),
    String(p.quantity * Number(p.purchase_price)),
    p.status,
  ]);

  downloadCSV(headers, rows, filename);
}
