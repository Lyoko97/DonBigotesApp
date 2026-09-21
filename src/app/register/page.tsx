"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import RegisterForm from "@/components/forms/RegisterForm";
import type { Role } from "@/types/auth";

// Crear cuentas es una acción exclusiva del admin (dueño del comedor); un
// encargado que intente entrar por URL directa es enviado a /dashboard.
const ADMIN_ONLY: Role[] = ["admin"];

export default function RegisterPage() {
  return (
    <ProtectedRoute allowedRoles={ADMIN_ONLY}>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-hueso px-4 py-10">
        <div className="w-full max-w-sm rounded-xl border border-madera/20 bg-crema p-8 shadow-lg">
          <h1 className="mb-1 text-center text-2xl font-bold text-vino">Nuevo usuario</h1>
          <p className="mb-6 text-center text-sm text-madera">
            Crea la cuenta de un nuevo miembro del equipo
          </p>
          <RegisterForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
