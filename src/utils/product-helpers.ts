export function getStockColor(quantity: number): string {
  if (quantity === 0) return "text-[#EF4444]";
  if (quantity <= 20) return "text-[#F59E0B]";
  return "text-[#10B981]";
}

export function getStockStatus(quantity: number): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (quantity === 0) return { label: "Rupture", variant: "danger" };
  if (quantity <= 20) return { label: "Stock bas", variant: "warning" };
  return { label: "En stock", variant: "success" };
}

export function getProductStatus(status: string): {
  label: string;
  variant: "success" | "warning" | "neutral";
} {
  if (status === "active") return { label: "Actif", variant: "success" };
  if (status === "draft") return { label: "Brouillon", variant: "warning" };
  return { label: "Archivé", variant: "neutral" };
}
