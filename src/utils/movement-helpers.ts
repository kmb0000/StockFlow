export function getMovementStatus(status: string): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (status === "VALIDATED") return { label: "Validé", variant: "success" };
  if (status === "REJECTED") return { label: "Rejeté", variant: "danger" };
  return { label: "En attente", variant: "warning" };
}

export function getMovementType(type: string): {
  label: string;
  variant: "success" | "danger";
} {
  if (type === "IN") return { label: "Entrée", variant: "success" };
  return { label: "Sortie", variant: "danger" };
}
