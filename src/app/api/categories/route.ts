import { NextResponse } from "next/server";
import * as categoryService from "@/lib/categories/categories.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { requireAuth, requireRole } from "@/lib/auth/require-auth";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function GET() {
  try {
    await requireAuth();
    const categories = await categoryService.getAllCategories();
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des catégories",
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const context = await createActivityContext();

    const body = await request.json();
    const category = await categoryService.createCategory(body, context);

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "Erreur lors de la création de la catégorie");
  }
}
