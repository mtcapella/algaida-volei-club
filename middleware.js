// middleware.js  (raíz del proyecto)
import { NextResponse } from "next/server";

// Orígenes permitidos
const allowedOrigins = ["http://localhost:3000", "https://algaidavoleiclub.es"];

export function middleware(req) {
  const origin = req.headers.get("origin");

  // 1️⃣  Bloquea orígenes no autorizados
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse("Origen no permitido", { status: 403 });
  }

  // 2️⃣  Responde al pre-flight (OPTIONS)
  if (req.method === "OPTIONS") {
    return createCorsResponse(origin);
  }

  // 3️⃣  Petición normal: deja pasar y añade cabeceras CORS
  const res = NextResponse.next();
  setCorsHeaders(res, origin);
  return res;
}

function createCorsResponse(origin) {
  const res = new NextResponse(null, { status: 204 });
  setCorsHeaders(res, origin);
  return res;
}

function setCorsHeaders(res, origin) {
  if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin"); // para caché
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export const config = {
  matcher: ["/api/:path*"], // solo tus endpoints
};
