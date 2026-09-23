"use client";

import { useState } from "react";
import { useOrders } from "@/context/OrdersContext";
import { formatTime } from "@/lib/format";

// Indicador de la última sincronización + botón para actualizar a mano.
export default function SyncStatus() {
  const { lastUpdated, error, refresh } = useOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex items-center gap-3 text-sm text-madera">
        <span>
          {lastUpdated ? `Actualizado ${formatTime(lastUpdated)}` : "Sincronizando..."}
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-md border border-madera/30 bg-white px-3 py-1 text-xs font-semibold text-madera transition-colors hover:bg-crema disabled:opacity-60"
        >
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
