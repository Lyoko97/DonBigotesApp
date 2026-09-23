"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { OrdersProvider, useOrders } from "@/context/OrdersContext";
import StatCard from "@/components/dashboard/StatCard";
import ActiveOrders from "@/components/dashboard/ActiveOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import TopDishesList from "@/components/dashboard/TopDishesList";
import StatusDistribution from "@/components/dashboard/StatusDistribution";
import SyncStatus from "@/components/orders/SyncStatus";
import SyncErrorBanner from "@/components/orders/SyncErrorBanner";
import { computeDashboardSummary } from "@/lib/dashboardStats";
import { formatCurrency, formatLongDate } from "@/lib/format";

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function DashboardContent() {
  const { user } = useAuth();
  const { orders, dishes, isLoading, todayKey } = useOrders();

  const summary = todayKey ? computeDashboardSummary(orders, dishes, todayKey) : null;
  const loading = isLoading || !summary;
  const isAdmin = user?.role === "admin";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vino">Bienvenido/a, {user?.nombre}</h1>
          <p className="mt-1 text-madera">
            Rol actual: <span className="font-semibold capitalize">{user?.role}</span>
            {todayKey && <span className="capitalize"> · {formatLongDate(todayKey)}</span>}
          </p>
        </div>
        <SyncStatus />
      </div>

      <SyncErrorBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pedidos de hoy"
          value={String(summary?.ordersToday ?? 0)}
          hint={summary ? pluralize(summary.cancelledToday, "cancelado", "cancelados") : undefined}
          isLoading={loading}
        />
        <StatCard
          label="Pedidos activos"
          value={String(summary?.inProgressToday ?? 0)}
          hint="Pendientes, en preparación o listos"
          highlight={!!summary && summary.inProgressToday > 0}
          isLoading={loading}
        />
        <StatCard
          label="Platillos disponibles"
          value={String(summary?.availableDishes ?? 0)}
          hint={summary ? `de ${summary.totalDishes} en el menú` : undefined}
          isLoading={loading}
        />
        <StatCard
          label="Ventas del día"
          value={String(summary?.salesToday ?? 0)}
          hint="Pedidos entregados"
          isLoading={loading}
        />
      </div>

      <div className="mt-6">
        {summary ? (
          <ActiveOrders orders={summary.activeOrders} />
        ) : (
          <div className="h-40 animate-pulse rounded-xl border border-madera/20 bg-white" />
        )}
      </div>

      {isAdmin && (
        // Sección exclusiva del dueño del comedor.
        <section className="mt-10" aria-labelledby="admin-heading">
          <h2
            id="admin-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-cobre"
          >
            Solo admin · Ventas e ingresos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Ingresos de hoy"
              value={formatCurrency(summary?.revenueToday ?? 0)}
              hint={summary ? `${formatCurrency(summary.pendingRevenueToday)} por cobrar` : undefined}
              highlight
              isLoading={loading}
            />
            <StatCard
              label="Esta semana"
              value={formatCurrency(summary?.week.revenue ?? 0)}
              hint={summary ? `${pluralize(summary.week.orders, "pedido", "pedidos")} · desde el lunes` : undefined}
              isLoading={loading}
            />
            <StatCard
              label="Este mes"
              value={formatCurrency(summary?.month.revenue ?? 0)}
              hint={summary ? pluralize(summary.month.orders, "pedido entregado", "pedidos entregados") : undefined}
              isLoading={loading}
            />
            <StatCard
              label="Ticket promedio"
              value={formatCurrency(summary?.averageTicketMonth ?? 0)}
              hint="Por pedido entregado este mes"
              isLoading={loading}
            />
          </div>

          {summary && todayKey ? (
            <div className="mt-4 flex flex-col gap-4">
              <SalesChart days={summary.last7Days} todayKey={todayKey} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TopDishesList
                  dishes={summary.topDishes}
                  title="Platillos más vendidos (7 días)"
                />
                <StatusDistribution counts={summary.statusCounts} />
              </div>
            </div>
          ) : (
            <div className="mt-4 h-64 animate-pulse rounded-xl border border-madera/20 bg-white" />
          )}
        </section>
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
