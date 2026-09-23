"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { OrdersProvider, useOrders } from "@/context/OrdersContext";
import StatCard from "@/components/dashboard/StatCard";
import TopDishesList from "@/components/dashboard/TopDishesList";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SyncStatus from "@/components/orders/SyncStatus";
import { computeDashboardSummary } from "@/lib/dashboardStats";
import { formatCurrency } from "@/lib/format";

function DashboardContent() {
  const { user } = useAuth();
  const { orders, dishes, isLoading, todayKey } = useOrders();

  const summary = todayKey ? computeDashboardSummary(orders, dishes, todayKey) : null;
  const show = (value: string) => (isLoading || !summary ? "—" : value);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vino">Bienvenido/a, {user?.nombre}</h1>
          <p className="mt-1 text-madera">
            Rol actual: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>
        <SyncStatus />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pedidos de hoy"
          value={show(String(summary?.ordersToday ?? 0))}
          hint={summary ? `${summary.inProgressToday} en curso · ${summary.cancelledToday} cancelados` : undefined}
        />
        <StatCard
          label="Platillos disponibles"
          value={show(String(summary?.availableDishes ?? 0))}
          hint={summary ? `de ${summary.totalDishes} en el menú` : undefined}
        />
        <StatCard
          label="Ventas del día"
          value={show(String(summary?.salesToday ?? 0))}
          hint="Pedidos entregados"
        />
      </div>

      {user?.role === "admin" && summary && (
        // Sección exclusiva del dueño del comedor: ingresos y ranking.
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cobre">
            Solo admin · Ingresos del día
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Ingresos cobrados"
              value={formatCurrency(summary.revenueToday)}
              hint="Suma de pedidos entregados"
              highlight
            />
            <StatCard
              label="Por cobrar"
              value={formatCurrency(summary.pendingRevenueToday)}
              hint="Pedidos todavía en curso"
            />
            <StatCard
              label="Ticket promedio"
              value={formatCurrency(summary.averageTicket)}
              hint="Por pedido entregado"
            />
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <RecentOrders orders={summary.recentOrders} />
          {user?.role === "admin" && <TopDishesList dishes={summary.topDishes} />}
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <OrdersProvider>
        <DashboardContent />
      </OrdersProvider>
    </ProtectedRoute>
  );
}
