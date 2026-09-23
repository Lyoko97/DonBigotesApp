"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { OrdersProvider, useOrders } from "@/context/OrdersContext";
import OrderForm from "@/components/orders/OrderForm";
import OrderList from "@/components/orders/OrderList";
import OrderStatusFilter, { type StatusFilterValue } from "@/components/orders/OrderStatusFilter";
import SyncStatus from "@/components/orders/SyncStatus";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { toBusinessDateKey } from "@/lib/format";

function PedidosContent() {
  const { orders, isLoading, todayKey } = useOrders();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("todos");
  const [onlyToday, setOnlyToday] = useState(true);

  const ordersInRange =
    onlyToday && todayKey
      ? orders.filter((order) => toBusinessDateKey(order.createdAt) === todayKey)
      : orders;

  const counts = { todos: ordersInRange.length } as Record<StatusFilterValue, number>;
  for (const status of ORDER_STATUSES) {
    counts[status] = ordersInRange.filter((order) => order.status === status).length;
  }

  const visibleOrders =
    statusFilter === "todos"
      ? ordersInRange
      : ordersInRange.filter((order) => order.status === statusFilter);

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-vino">Pedidos - Don Bigotes</h1>
          <p className="text-madera">Registro de comandas y seguimiento de su estado</p>
        </div>
        <SyncStatus />
      </div>

      <OrderForm />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} counts={counts} />
        <label className="flex shrink-0 items-center gap-2 text-sm text-madera">
          <input
            type="checkbox"
            checked={onlyToday}
            onChange={(e) => setOnlyToday(e.target.checked)}
            className="h-4 w-4 accent-vino"
          />
          Solo pedidos de hoy
        </label>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-madera">Cargando pedidos de Don Bigotes...</div>
      ) : (
        <OrderList
          orders={visibleOrders}
          emptyMessage={
            statusFilter === "todos"
              ? "Todavía no hay pedidos registrados."
              : "No hay pedidos con este estado."
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
