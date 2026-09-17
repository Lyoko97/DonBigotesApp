"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-vino">Bienvenido/a, {user?.nombre}</h1>
      <p className="mt-1 text-madera">
        Rol actual: <span className="font-semibold capitalize">{user?.role}</span>
      </p>

      {/* TODO: reemplazar estas tarjetas con datos reales de menú/pedidos
          cuando Persona 2 y Persona 3 conecten sus módulos. */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-madera">Pedidos de hoy</p>
          <p className="mt-2 text-3xl font-bold text-vino">—</p>
        </div>
        <div className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-madera">Platillos disponibles</p>
          <p className="mt-2 text-3xl font-bold text-vino">—</p>
        </div>
        <div className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-madera">Ventas del día</p>
          <p className="mt-2 text-3xl font-bold text-vino">—</p>
        </div>
      </div>

      {user?.role === "admin" && (
        // TODO: Persona 2/3 pueden agregar aquí secciones exclusivas para
        // admin (ej. reportes de ventas, gestión de usuarios).
        <div className="mt-8 rounded-xl border border-cobre/40 bg-cobre/10 p-5">
          <p className="text-sm text-madera">
            Como <strong>admin</strong>, más adelante verás aquí controles
            exclusivos del dueño del comedor.
          </p>
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <DashboardContent />
    </ProtectedRoute>
  );
}
