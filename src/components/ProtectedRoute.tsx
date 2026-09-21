"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  // Si se define, solo usuarios con uno de estos roles pueden ver la ruta;
  // cualquier otro usuario autenticado es enviado a /dashboard.
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAllowedRole = !allowedRoles || (!!user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAllowedRole) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, isAllowedRole, router]);

  if (isLoading || !user || !isAllowedRole) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-madera">Cargando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
}
