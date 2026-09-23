import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendiente: "bg-cobre/15 text-cobre border-cobre/30",
  en_preparacion: "bg-madera/15 text-madera border-madera/30",
  listo: "bg-vino/10 text-vino border-vino/30",
  entregado: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
