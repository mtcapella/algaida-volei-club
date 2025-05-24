import { NextResponse } from "next/server";

// origenes permitidos para CORS
const originMatchers = [
  /^https?:\/\/localhost:3000$/, // dev
  /^https?:\/\/(?:www\.)?algaidavoleiclub\.es$/, // prod (con / sin www)
];

// añade automáticamente la URL del deploy-preview  (ej. my-branch.vercel.app)
if (process.env.VERCEL_URL) {
  originMatchers.push(
    new RegExp(`^https://${process.env.VERCEL_URL.replace(/\./g, "\\.")}$`)
  );
}

/* ───────────────  Middleware ─────────────── */
export function middleware(req) {
  const origin = req.headers.get("origin");

  //  si no hay cabecera Origin, no es CORS
  if (req.method === "OPTIONS") return corsOK(origin);

  // CORS – solo cuando llega cabecera Origin
  if (origin && !originMatchers.some((re) => re.test(origin))) {
    return new NextResponse("Origen no permitido", { status: 403 });
  }

  // 3. Continúa + cabeceras CORS
  const res = NextResponse.next();
  setCors(res, origin);
  return res;
}

// Helper que responde a las peticiones OPTIONS
function corsOK(origin) {
  const res = new NextResponse(null, { status: 204 });
  setCors(res, origin);
  return res;
}

function setCors(res, origin) {
  if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin"); // para que la caché distinga
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

// solo se aplica a las rutas de la API
export const config = { matcher: ["/api/:path*"] };
