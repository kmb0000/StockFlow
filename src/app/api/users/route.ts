import { NextResponse } from "next/server";
import * as userService from "@/lib/users/users.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { requireRole } from "@/lib/auth/require-auth";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const users = await userService.getAllUsers();

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des utilisateurs",
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);

    const context = await createActivityContext();

    const body = await request.json();

    const user = await userService.createUser(body, context);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "Erreur lors de la création de l'utilisateur");
  }
}
