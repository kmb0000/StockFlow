import { requireRole } from "@/lib/auth/require-auth";
import { getAll } from "@/lib/activity_logs/activity_logs.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const logs = await getAll();
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération des logs");
  }
}
