import type { DailySales } from "@/types/dashboard";
import { formatCurrency, formatDayLabel, formatLongDate } from "@/lib/format";

// Barras verticales de ingresos por día (una sola serie, un solo color:
// sin leyenda, el título la nombra). Cada barra muestra su detalle al pasar
// el mouse o al enfocarla con el teclado, y debajo hay una tabla accesible.
export default function SalesChart({ days, todayKey }: { days: DailySales[]; todayKey: string }) {
  const maxRevenue = Math.max(...days.map((day) => day.revenue), 1);
  const total = days.reduce((acc, day) => acc + day.revenue, 0);

  return (
    <section className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-vino">Ingresos de los últimos 7 días</h2>
        <p className="text-sm text-madera">
          Total: <span className="font-semibold text-vino">{formatCurrency(total)}</span>
        </p>
      </div>

      <div className="flex h-48 items-end gap-2 border-b border-madera/30">
        {days.map((day) => {
          const isToday = day.dateKey === todayKey;
          const heightPercent = (day.revenue / maxRevenue) * 100;
          return (
            <div
              key={day.dateKey}
              tabIndex={0}
              role="img"
              aria-label={`${formatLongDate(day.dateKey)}: ${formatCurrency(day.revenue)}, ${day.orders} ${
                day.orders === 1 ? "pedido entregado" : "pedidos entregados"
              }`}
              className="group relative flex h-full flex-1 cursor-default items-end justify-center rounded-t focus:outline-none focus-visible:bg-hueso/60 hover:bg-hueso/60"
            >
              {/* Tooltip */}
              <div aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max -translate-x-1/2 rounded-md bg-stone-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">
                <p className="font-semibold capitalize">{formatLongDate(day.dateKey)}</p>
                <p>
                  {formatCurrency(day.revenue)} · {day.orders}{" "}
                  {day.orders === 1 ? "pedido" : "pedidos"}
                </p>
              </div>
              {/* Etiqueta directa solo para hoy, para no llenar el gráfico de números */}
              {isToday && day.revenue > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-vino"
                  style={{ bottom: `calc(${heightPercent}% + 4px)` }}
                >
                  {formatCurrency(day.revenue)}
                </span>
              )}
              <div
                className={`w-full max-w-12 rounded-t ${isToday ? "bg-vino" : "bg-cobre"}`}
                style={{ height: `${Math.max(heightPercent, day.revenue > 0 ? 2 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {days.map((day) => (
          <span
            key={day.dateKey}
            className={`flex-1 text-center text-xs capitalize ${
              day.dateKey === todayKey ? "font-semibold text-vino" : "text-madera"
            }`}
          >
            {day.dateKey === todayKey ? "Hoy" : formatDayLabel(day.dateKey)}
          </span>
        ))}
      </div>

      <details className="mt-4 text-sm text-madera">
        <summary className="cursor-pointer font-medium hover:text-vino">Ver como tabla</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Ingresos y pedidos entregados por día</caption>
            <thead>
              <tr className="border-b border-madera/20 text-xs uppercase tracking-wide">
                <th className="py-1.5 font-semibold">Día</th>
                <th className="py-1.5 text-right font-semibold">Pedidos</th>
                <th className="py-1.5 text-right font-semibold">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.dateKey} className="border-b border-madera/10">
                  <td className="py-1.5 capitalize text-stone-800">{formatLongDate(day.dateKey)}</td>
                  <td className="py-1.5 text-right text-stone-800">{day.orders}</td>
                  <td className="py-1.5 text-right text-stone-800">{formatCurrency(day.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
