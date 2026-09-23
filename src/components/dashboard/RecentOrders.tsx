import Link from "next/link";
import type { Order } from "@/types/order";
import { formatCurrency, formatOrderNumber, formatTime } from "@/lib/format";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

export default function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <section className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-vino">Últimos pedidos</h2>
        <Link href="/pedidos" className="text-sm font-semibold text-cobre hover:underline">
          Ver todos →
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-madera">Todavía no hay pedidos hoy.</p>
      ) : (
        <ul className="divide-y divide-madera/10">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">{order.customerName}</p>
                <p className="text-xs text-madera">
                  {formatOrderNumber(order.number)} · {formatTime(order.createdAt)} ·{" "}
                  {formatCurrency(order.total)}
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
