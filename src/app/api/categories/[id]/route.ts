import { NextResponse } from "next/server";
import * as categoryService from "@/lib/categories/categories.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { requireAuth, requireRole } from "@/lib/auth/require-auth";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const category = await categoryService.getCategoryById(id);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération de la catégorie",
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const context = await createActivityContext();

    const { id } = await params;
    const body = await request.json();

    const category = await categoryService.updateCategory(id, body, context);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour de la catégorie",
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["ADMIN"]);

    const context = await createActivityContext();

    const { id } = await params;

    await categoryService.deleteCategory(id, context);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la suppression de la catégorie",
    );
  }
}
