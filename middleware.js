import { NextResponse } from "next/server";

const allowedHosts = ["localhost:3000", "algaidavoleiclub.es"];

export function middleware(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // Si hay origin o referer, comprobar si están en la whitelist
  const isAllowed =
    (origin && allowedHosts.some((h) => origin.includes(h))) ||
    (referer && allowedHosts.some((h) => referer.includes(h))) ||
    (host && allowedHosts.some((h) => host.includes(h)));

  if (!isAllowed) {
    return new NextResponse("Request bloqueado: origen no autorizado", {
      status: 403,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
