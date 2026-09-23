import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/orderStatus";

// Barras horizontales con etiqueta y número: el estado se identifica por el
// texto, no por el color (todas las barras usan el mismo tono).
export default function StatusDistribution({ counts }: { counts: Record<OrderStatus, number> }) {
  const total = ORDER_STATUSES.reduce((acc, status) => acc + counts[status], 0);
  const max = Math.max(1, ...ORDER_STATUSES.map((status) => counts[status]));

  return (
    <section className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-vino">
        Pedidos de hoy por estado{" "}
        <span className="text-base font-semibold text-madera">({total})</span>
      </h2>
      {total === 0 ? (
        <p className="text-sm text-madera">Aún no hay pedidos hoy.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ORDER_STATUSES.map((status) => {
            const count = counts[status];
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <li key={status}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-stone-900">{ORDER_STATUS_LABELS[status]}</span>
                  <span className="text-madera">
                    <span className="font-semibold text-vino">{count}</span> · {percent}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-hueso">
                  <div
                    className="h-2 rounded-full bg-madera"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
