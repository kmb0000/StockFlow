import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/not-found.error";
import { NextResponse } from "next/server";

export function handleApiError(error: unknown, defaultMessage: string) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 },
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 404 },
    );
  }

  console.error("[API] Erreur inattendue", error);

  return NextResponse.json(
    {
      success: false,
      message: defaultMessage,
    },
    { status: 500 },
  );
}
