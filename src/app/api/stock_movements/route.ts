import { createActivityContext } from "@/lib/activity_logs/activity-context";
import { requireAuth, requireRole } from "@/lib/auth/require-auth";
import * as stockMovement from "@/lib/stock_movements/stock_movements.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const movements = await stockMovement.getAllStockMovementsWithRelations();

    return NextResponse.json({
      success: true,
      data: movements,
      count: movements.length,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des mouvements",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["ADMIN", "MANAGER"]);

    const context = await createActivityContext();

    const body = await request.json();

    const movement = await stockMovement.createStockMovement(
      user.id,
      body,
      context,
    );

    return NextResponse.json(
      {
        success: true,
        data: movement,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "Erreur lors de la création du mouvement");
  }
}
