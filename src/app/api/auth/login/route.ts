import { NextResponse } from "next/server";
import { login } from "@/lib/auth/auth.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const context = await createActivityContext();

    const { token, refreshToken, user } = await login(body, context);

    const response = NextResponse.json({
      success: true,
      data: user,
    });

    // Access Token (15 minutes)
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    // Refresh Token (30 jours)
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, "Erreur lors de la connexion");
  }
}
