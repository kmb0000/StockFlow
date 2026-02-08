import { db } from "@/lib/db/connection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await db.query(
      `SELECT
      p.id, 
      p.sku, 
      p.name, 
      p.description, 
      p.quantity, 
      p.selling_price, 
      p.purchase_price, 
      p.status, 
      p.created_at, 
      
      c.id AS category_id, 
      c.name AS category_name, 
      c.color, 
      c.icon, 
      
      s.id AS supplier_id, 
      s.name AS supplier_name, 

      u.id AS created_by_id, 
      u.name AS created_by_name, 
      u.role AS created_by_role 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC`,
    );
    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("[API] GET /api/products error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 },
    );
  }
}
