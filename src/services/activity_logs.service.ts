export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
}

export async function getAll(): Promise<ActivityLog[]> {
  const res = await fetch("/api/activity_logs");
  if (!res.ok) throw new Error("Erreur lors de la récupération des logs");
  const json = await res.json();
  return json.data;
}
