"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import type { Order, OrderActionResult } from "@/types/order";
import { getNextStatus, isInProgress, ORDER_STATUS_ACTION_LABELS } from "@/lib/orderStatus";
import { formatCurrency, formatOrderNumber, formatTime } from "@/lib/format";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

type PendingConfirm = "cancel" | "delete" | null;

export default function OrderCard({ order }: { order: Order }) {
  const { role } = useAuth();
  const { updateStatus, cancelOrder, deleteOrder } = useOrders();
  const [confirming, setConfirming] = useState<PendingConfirm>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = getNextStatus(order.status);
  const canCancel = isInProgress(order.status);
  // Borrado definitivo: solo el admin (dueño del comedor). El encargado
  // cancela, lo que conserva el pedido en el historial.
  const canDelete = role === "admin";

  async function run(action: () => Promise<OrderActionResult>) {
    setIsWorking(true);
    setError(null);
    const result = await action();
    setIsWorking(false);
    setConfirming(null);
    if (!result.success) setError(result.error ?? "No se pudo completar la acción.");
  }

  return (
    <article
      className={`flex flex-col justify-between rounded-lg border bg-white p-5 shadow ${
        order.status === "cancelado" ? "border-stone-200 opacity-75" : "border-madera/20"
      }`}
    >
      <div>
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-cobre">
              {formatOrderNumber(order.number)} · {formatTime(order.createdAt)}
            </p>
            <h3 className="truncate text-lg font-semibold text-stone-900">{order.customerName}</h3>
            {order.customerPhone && (
              <p className="text-sm text-madera">Tel. {order.customerPhone}</p>
            )}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <ul className="mb-3 divide-y divide-madera/10 border-y border-madera/10 text-sm">
          {order.items.map((item) => (
            <li key={item.dishId} className="flex justify-between gap-3 py-1.5">
              <span className="text-stone-800">
                <span className="font-semibold text-vino">{item.quantity}×</span> {item.dishName}
              </span>
              <span className="text-madera">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="mb-3 rounded bg-crema px-2 py-1 text-sm text-madera">
            <span className="font-semibold">Nota:</span> {order.notes}
          </p>
        )}

        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-xs text-madera/80">Registró: {order.createdBy.nombre}</span>
          <span className="text-lg font-bold text-vino">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-madera/10 pt-3">
          <span className="text-sm text-stone-800">
            {confirming === "cancel"
              ? "¿Cancelar este pedido?"
              : "¿Eliminar el pedido definitivamente?"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={isWorking}
              className="rounded-md border border-madera/30 px-3 py-1.5 text-sm font-medium text-madera transition-colors hover:bg-crema disabled:opacity-60"
            >
              No
            </button>
            <button
              type="button"
              onClick={() =>
                run(() => (confirming === "cancel" ? cancelOrder(order.id) : deleteOrder(order.id)))
              }
              disabled={isWorking}
              className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
            >
              {isWorking ? "Procesando..." : "Sí, confirmar"}
            </button>
          </div>
        </div>
      ) : (
        (nextStatus || canCancel || canDelete) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-madera/10 pt-3">
            {nextStatus && (
              <button
                type="button"
                onClick={() => run(() => updateStatus(order.id, nextStatus))}
                disabled={isWorking}
                className="rounded-md bg-vino px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-vino/90 disabled:opacity-60"
              >
                {isWorking ? "Guardando..." : ORDER_STATUS_ACTION_LABELS[nextStatus]}
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => setConfirming("cancel")}
                disabled={isWorking}
                className="rounded-md border border-cobre/40 px-3 py-1.5 text-sm font-medium text-cobre transition-colors hover:bg-cobre/10 disabled:opacity-60"
              >
                Cancelar
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setConfirming("delete")}
                disabled={isWorking}
                title="Eliminar pedido (solo admin)"
                className="ml-auto rounded border border-red-200 px-2 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                Eliminar
              </button>
            )}
          </div>
        )
      )}
    </article>
  );
}
