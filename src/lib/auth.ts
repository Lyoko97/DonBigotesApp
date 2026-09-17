import type { PublicUser, User } from "@/types/auth";

const SESSION_KEY = "donbigotes_session";
const SESSION_COOKIE = "donbigotes_session";

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, nombre: user.nombre, email: user.email, role: user.role };
}

export function findUserByCredentials(
  users: User[],
  email: string,
  password: string
): User | undefined {
  return users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function emailExists(users: User[], email: string): boolean {
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

// TODO: cuando exista el backend real, la sesión debería manejarse con
// cookies httpOnly emitidas por el servidor (ej. JWT) en vez de localStorage.
// La cookie no-httpOnly de aquí solo existe para que el middleware (que
// corre en el edge, sin acceso a localStorage) pueda proteger rutas.
export function persistSession(user: PublicUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(user.id)}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function readSession(): PublicUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
