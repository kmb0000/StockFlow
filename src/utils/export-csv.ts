import { ProductWithRelations } from "@/lib/products/products.types";

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
        // sécuriser les valeurs (guillemets si nécessaire)
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
