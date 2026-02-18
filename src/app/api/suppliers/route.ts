import { NextResponse } from "next/server";
import * as supplierService from "@/lib/suppliers/suppliers.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { requireAuth, requireRole } from "@/lib/auth/require-auth";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function GET() {
  try {
    await requireAuth();
    const suppliers = await supplierService.getAllSuppliers();

    return NextResponse.json({
      success: true,
      data: suppliers,
      count: suppliers.length,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des founisseurs",
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const context = await createActivityContext();

    const body = await request.json();

    const supplier = await supplierService.createSupplier(body, context);

    return NextResponse.json(
      {
        success: true,
        data: supplier,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "Erreur lors de la création du fournisseur");
  }
}
