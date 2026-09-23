"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { OrdersProvider, useOrders } from "@/context/OrdersContext";
import OrderForm from "@/components/orders/OrderForm";
import OrderList from "@/components/orders/OrderList";
import OrderListSkeleton from "@/components/orders/OrderListSkeleton";
import OrderStatusFilter, { type StatusFilterValue } from "@/components/orders/OrderStatusFilter";
import OrderDateFilter from "@/components/orders/OrderDateFilter";
import { matchesDateFilter, type DateFilterValue } from "@/lib/orderFilters";
import SyncStatus from "@/components/orders/SyncStatus";
import SyncErrorBanner from "@/components/orders/SyncErrorBanner";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/orderStatus";
import { toBusinessDateKey } from "@/lib/format";

function PedidosContent() {
  const { orders, isLoading, todayKey } = useOrders();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("todos");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: "hoy", customDate: "" });

  const ordersInRange = todayKey
    ? orders.filter((order) =>
        matchesDateFilter(toBusinessDateKey(order.createdAt), dateFilter, todayKey)
      )
    : orders;

  const counts = { todos: ordersInRange.length } as Record<StatusFilterValue, number>;
  for (const status of ORDER_STATUSES) {
    counts[status] = ordersInRange.filter((order) => order.status === status).length;
  }

  const visibleOrders =
    statusFilter === "todos"
      ? ordersInRange
      : ordersInRange.filter((order) => order.status === statusFilter);

  const hasFilters = statusFilter !== "todos" || dateFilter.preset !== "todas";
  const emptyTitle =
    statusFilter === "todos"
      ? "No hay pedidos en este rango de fechas."
      : `No hay pedidos "${ORDER_STATUS_LABELS[statusFilter]}" en este rango de fechas.`;

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-vino">Pedidos - Don Bigotes</h1>
          <p className="text-madera">Registro de comandas y seguimiento de su estado</p>
        </div>
        <SyncStatus />
      </div>

      <SyncErrorBanner />

      <OrderForm />

      <div className="mb-4 flex flex-col gap-3">
        <OrderDateFilter value={dateFilter} onChange={setDateFilter} todayKey={todayKey} />
        <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} counts={counts} />
      </div>

      {isLoading ? (
        <OrderListSkeleton />
      ) : (
        <OrderList
          orders={visibleOrders}
          emptyTitle={emptyTitle}
          emptyHint={
            hasFilters
              ? "Prueba con otra fecha u otro estado, o registra un pedido nuevo arriba."
              : "Registra el primer pedido con el formulario de arriba."
          }
        />
      )}
    </main>
  );
}

export default function PedidosPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <OrdersProvider>
        <PedidosContent />
      </OrdersProvider>
    </ProtectedRoute>
  );
}
