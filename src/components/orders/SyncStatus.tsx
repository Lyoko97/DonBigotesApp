"use client";

import { useOrders } from "@/context/OrdersContext";
import { useNow } from "@/hooks/useNow";
import { formatRelativeTime } from "@/lib/format";

// Indicador de la última sincronización + botón para actualizar a mano.
export default function SyncStatus() {
  const { lastUpdated, isLoading, isRefreshing, refresh } = useOrders();
  const now = useNow();

  let label = "Sincronizando...";
  if (lastUpdated && now > 0) label = `Actualizado ${formatRelativeTime(lastUpdated, now)}`;

  return (
    <div className="flex items-center gap-3 text-sm text-madera" aria-live="polite">
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 rounded-full ${
            isRefreshing ? "animate-pulse bg-cobre" : "bg-green-600"
          }`}
        />
        {label}
      </span>
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={isLoading || isRefreshing}
        className="rounded-md border border-madera/30 bg-white px-3 py-1 text-xs font-semibold text-madera transition-colors hover:bg-crema disabled:opacity-60"
      >
        {isRefreshing ? "Actualizando..." : "Actualizar"}
      </button>
    </div>
  );
}
