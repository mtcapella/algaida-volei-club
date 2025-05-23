// middleware.js
import { NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:3000", // para desarrollo
  "https://tu-dominio-en-produccion.com",
];

export function middleware(request) {
  const origin = request.headers.get("origin");

  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse("Origin no permitido por CORS", { status: 403 });
  }

  return NextResponse.next();
}

// Aplica a todas las rutas API
export const config = {
  matcher: ["/api/:path*"],
};
