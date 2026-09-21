import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/menu", "/pedidos", "/register"];
const SESSION_COOKIE = "donbigotes_session";

// TODO: cuando exista el backend real, validar aquí un JWT firmado en vez
// de solo comprobar la presencia de la cookie de sesión mock.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/menu/:path*", "/pedidos/:path*", "/register/:path*"],
};
