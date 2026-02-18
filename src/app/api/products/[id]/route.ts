import { NextResponse } from "next/server";
import * as productsService from "@/lib/products/products.service";
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

    const product = await productsService.getProductById(id);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération du produit");
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

    const product = await productsService.updateProduct(id, body, context);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la mise à jour du produit");
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

    await productsService.deleteProduct(id, context);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la suppression du produit");
  }
}
