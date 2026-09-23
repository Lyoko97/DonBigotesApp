"use client";

import Link from "next/link";
import type { Order } from "@/types/order";
import { DELIVERY_TYPE_LABELS } from "@/lib/orderStatus";
import { formatCurrency, formatOrderNumber, formatRelativeTime } from "@/lib/format";
import { useNow } from "@/hooks/useNow";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

// Pedidos en curso del día (pendientes, en preparación y listos), el más
// antiguo primero: es el que lleva más tiempo esperando.
export default function ActiveOrders({ orders }: { orders: Order[] }) {
  const now = useNow();

  return (
    <section className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-vino">
          Pedidos activos <span className="text-base font-semibold text-madera">({orders.length})</span>
        </h2>
        <Link href="/pedidos" className="text-sm font-semibold text-cobre hover:underline">
          Ir a pedidos →
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-md bg-crema px-3 py-4 text-center text-sm text-madera">
          No hay pedidos en curso en este momento.
        </p>
      ) : (
        <ul className="divide-y divide-madera/10">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">
                  {formatOrderNumber(order.number)} · {order.customerName}
                </p>
                <p className="text-xs text-madera">
                  {now > 0 ? formatRelativeTime(order.createdAt, now) : "—"} ·{" "}
                  {DELIVERY_TYPE_LABELS[order.deliveryType]} · {formatCurrency(order.total)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
