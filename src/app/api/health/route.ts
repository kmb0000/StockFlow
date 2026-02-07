// 1. IMPORTS
import { db } from "@/lib/db/connection";
import { NextResponse } from "next/server";

// 2. FONCTION ASYNCHRONE GET
export async function GET() {
  // 3. ESSAYER de se connecter
  try {
    // 4. Requête SQL
    const result = await db.query("SELECT NOW() as server_time");

    // 5. Succès → Retourner 200 OK
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        serverTime: result.rows[0].server_time,
      },
    });

    // 6. Si ça échoue
  } catch (error) {
    // 7. Logger l'erreur
    console.error("Health check failed:", error);

    // 8. Retourner 503 Service Unavailable
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: "Database connection failed",
        },
      },
      { status: 503 },
    );
  }
}
