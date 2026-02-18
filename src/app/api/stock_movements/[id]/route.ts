import { NextResponse } from "next/server";
import * as stockMovementService from "@/lib/stock_movements/stock_movements.service";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await params;

    const movement = await stockMovementService.getStockMovementById(id);

    return NextResponse.json({
      success: true,
      data: movement,
    });
  } catch (error) {
    return handleApiError(error, "Impossible de trouver ce mouvement");
  }
}
