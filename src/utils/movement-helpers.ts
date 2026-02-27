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

export function getRelativeTime(date: string | Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "À l'instant";
  }
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  }

  return new Date(date).toLocaleDateString("fr-FR");
}
