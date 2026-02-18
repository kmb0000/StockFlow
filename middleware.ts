import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // On protège uniquement les routes API
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Toutes les routes auth sont publiques
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Non autorisé" },
      { status: 401 },
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(accessToken, secret);

    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { success: false, message: "Token invalide" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
