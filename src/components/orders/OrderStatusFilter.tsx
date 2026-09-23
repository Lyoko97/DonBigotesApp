import type { OrderStatus } from "@/types/order";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/orderStatus";

export type StatusFilterValue = OrderStatus | "todos";

interface OrderStatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  counts: Record<StatusFilterValue, number>;
}

const OPTIONS: StatusFilterValue[] = ["todos", ...ORDER_STATUSES];

export default function OrderStatusFilter({ value, onChange, counts }: OrderStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por estado">
      {OPTIONS.map((option) => {
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-vino bg-vino text-white"
                : "border-madera/30 bg-white text-madera hover:bg-crema"
            }`}
          >
            {option === "todos" ? "Todos" : ORDER_STATUS_LABELS[option]}{" "}
            <span className={isActive ? "text-white/80" : "text-madera/60"}>({counts[option]})</span>
          </button>
        );
      })}
    </div>
  );
}
