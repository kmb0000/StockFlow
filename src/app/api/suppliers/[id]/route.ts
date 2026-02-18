import { NextResponse } from "next/server";
import * as supplierService from "@/lib/suppliers/suppliers.service";
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

    const supplier = await supplierService.getSupplierById(id);

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération du fournisseur",
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

    const supplier = await supplierService.updateSupplier(id, body, context);

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour du fournisseur",
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

    await supplierService.deleteSupplier(id, context);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la suppression du fournisseur",
    );
  }
}
