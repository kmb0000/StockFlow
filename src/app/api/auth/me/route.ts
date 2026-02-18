import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { getCurrentUser } from "@/lib/auth/me.service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération du profil");
  }
}
