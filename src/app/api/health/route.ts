import { db } from "@/lib/db/connection";
import { NextResponse } from "next/server";

//Health check endpoint
//Vérifie que l'API et la DB sont opérationnelles

export async function GET() {
  try {
    //Faire la requête SQL
    const result = await db.query("SELECT NOW() as server_time");

    //Retourner le succès avec les données
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        serverTime: result.rows[0].server_time,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    //Si erreur, return message d'erreur
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: "Database connection failed",
        },
      },
      { status: 503 }, //503 = Service Unavailable (indisponible)
    );
  }
}
