import { NextResponse } from "next/server";
import * as userService from "@/lib/users/users.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { requireRole } from "@/lib/auth/require-auth";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;

    const user = await userService.getUserById(id);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération de l'utilisateur",
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN"]);

    const context = await createActivityContext();

    const { id } = await params;
    const body = await request.json();

    const user = await userService.updateUser(id, body, context);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour de l'utilisateur",
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireRole(["ADMIN"]);

    const { id } = await params;

    // Un admin ne peut pas se supprimer lui-même
    if (currentUser.id === id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous ne pouvez pas supprimer votre propre compte",
        },
        { status: 400 },
      );
    }

    const context = await createActivityContext();

    await userService.deleteUser(id, context);

    return NextResponse.json(
      {
        success: true,
      },
      { status: 204 },
    );
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la suppression de l'utilisateur",
    );
  }
}
