import { handleApiError } from "@/lib/utils/handle-api-error";
import * as stockMovementService from "@/lib/stock_movements/stock_movements.service";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-auth";
import { createActivityContext } from "@/lib/activity_logs/activity-context";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireRole(["ADMIN", "MANAGER"]);

    const context = await createActivityContext();

    const { id } = await params;

    const movement = await stockMovementService.validateStockMovement(
      id,
      user.id,
      context,
    );

    return NextResponse.json({
      success: true,
      data: movement,
    });
  } catch (error) {
    return handleApiError(error, "Impossible de valider le mouvement");
  }
}
