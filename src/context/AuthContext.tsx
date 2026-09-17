"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthContextValue, AuthResult, PublicUser, Role, User } from "@/types/auth";
import { mockUsers } from "@/lib/mockUsers";
import {
  clearSession,
  emailExists,
  findUserByCredentials,
  persistSession,
  readSession,
  toPublicUser,
} from "@/lib/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Copia mutable en memoria del "mock backend": vive mientras el servidor de
// desarrollo esté corriendo y se reinicia en cada recarga del server. Se
// reemplazará por la API REST real (ver TODOs en lib/auth.ts).
let usersDb: User[] = [...mockUsers];
let nextId = usersDb.length + 1;

// El servidor nunca tiene localStorage, así que su "snapshot" siempre es
// `false` (aún cargando); el cliente reporta `true` en cuanto se hidrata.
// Con useSyncExternalStore evitamos el patrón de poner un flag en un efecto
// de montaje, que dispara un setState innecesario y un render extra.
function subscribeNoop() {
  return () => {};
}
function getHasMountedClientSnapshot() {
  return true;
}
function getHasMountedServerSnapshot() {
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lectura perezosa de localStorage: corre durante el render (no en un
  // efecto) para no disparar un setState en cascada.
  const [user, setUser] = useState<PublicUser | null>(() => readSession());
  const hasMounted = useSyncExternalStore(
    subscribeNoop,
    getHasMountedClientSnapshot,
    getHasMountedServerSnapshot
  );
  const isLoading = !hasMounted;
  const router = useRouter();

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    // TODO: reemplazar por POST /api/auth/login cuando el backend esté listo.
    const found = findUserByCredentials(usersDb, email, password);
    if (!found) {
      return { success: false, error: "Correo o contraseña incorrectos." };
    }
    const publicUser = toPublicUser(found);
    persistSession(publicUser);
    setUser(publicUser);
    return { success: true };
  }, []);

  const register = useCallback(
    async (
      nombre: string,
      email: string,
      password: string,
      role: Role
    ): Promise<AuthResult> => {
      // TODO: reemplazar por POST /api/auth/register cuando el backend esté listo.
      if (emailExists(usersDb, email)) {
        return { success: false, error: "Ya existe una cuenta con ese correo." };
      }
      const newUser: User = { id: String(nextId++), nombre, email, password, role };
      usersDb = [...usersDb, newUser];
      const publicUser = toPublicUser(newUser);
      persistSession(publicUser);
      setUser(publicUser);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>.");
  }
  return ctx;
}
