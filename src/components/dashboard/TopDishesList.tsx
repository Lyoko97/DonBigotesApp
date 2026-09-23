import type { TopDish } from "@/types/dashboard";
import { formatCurrency } from "@/lib/format";

export default function TopDishesList({ dishes }: { dishes: TopDish[] }) {
  const maxQuantity = Math.max(1, ...dishes.map((dish) => dish.quantity));

  return (
    <section className="rounded-xl border border-madera/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-vino">Platillos más vendidos hoy</h2>
      {dishes.length === 0 ? (
        <p className="text-sm text-madera">Aún no hay ventas registradas hoy.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {dishes.map((dish, index) => (
            <li key={dish.dishId}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-stone-900">
                  <span className="mr-2 font-semibold text-cobre">{index + 1}.</span>
                  {dish.dishName}
                </span>
                <span className="shrink-0 text-madera">
                  <span className="font-semibold text-vino">{dish.quantity}</span> uds. ·{" "}
                  {formatCurrency(dish.revenue)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-hueso">
                <div
                  className="h-2 rounded-full bg-cobre"
                  style={{ width: `${(dish.quantity / maxQuantity) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
