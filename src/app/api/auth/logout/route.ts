import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { logoutSession } from "@/lib/auth/logout.service";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function POST() {
  try {
    const context = await createActivityContext();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      await logoutSession(refreshToken, context);
    }

    const response = NextResponse.json({
      success: true,
    });

    // Supprime access token
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    // Supprime refresh token
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, "Erreur lors de la déconnexion");
  }
}
