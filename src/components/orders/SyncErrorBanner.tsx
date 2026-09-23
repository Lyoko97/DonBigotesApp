"use client";

import { useOrders } from "@/context/OrdersContext";

// Aviso cuando falla la sincronización. Los últimos datos buenos se siguen
// mostrando debajo, así que el usuario puede seguir trabajando.
export default function SyncErrorBanner() {
  const { error, isRefreshing, refresh, lastUpdated } = useOrders();
  if (!error) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="text-sm text-red-800">
        <p className="font-semibold">{error}</p>
        {lastUpdated && (
          <p className="text-red-700">Se muestran los últimos datos que se pudieron cargar.</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={isRefreshing}
        className="shrink-0 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
      >
        {isRefreshing ? "Reintentando..." : "Reintentar"}
      </button>
    </div>
  );
}
