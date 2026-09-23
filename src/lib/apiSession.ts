import { NextResponse, type NextRequest } from "next/server";

// Mismo nombre de cookie que usan src/lib/auth.ts y src/proxy.ts. Se repite
// aquí para no modificar el módulo de autenticación.
const SESSION_COOKIE = "donbigotes_session";

// TODO(auth): la cookie mock solo contiene el id del usuario, sin firma ni
// rol. Cuando exista el backend real, validar aquí un JWT firmado y
// devolver también el rol para poder aplicar permisos en el servidor.
export function getSessionUserId(request: NextRequest): string | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Tu sesión expiró. Vuelve a iniciar sesión." },
    { status: 401 }
  );
}
