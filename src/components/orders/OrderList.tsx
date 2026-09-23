import type { Order } from "@/types/order";
import OrderCard from "@/components/orders/OrderCard";

interface OrderListProps {
  orders: Order[];
  emptyTitle: string;
  emptyHint?: string;
}

export default function OrderList({ orders, emptyTitle, emptyHint }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-madera/30 bg-crema px-6 py-10 text-center">
        <p className="text-3xl" aria-hidden="true">
          🧾
        </p>
        <p className="mt-2 font-semibold text-vino">{emptyTitle}</p>
        {emptyHint && <p className="mt-1 text-sm text-madera">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
