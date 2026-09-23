import type { Order } from "@/types/order";
import OrderCard from "@/components/orders/OrderCard";

export default function OrderList({ orders, emptyMessage }: { orders: Order[]; emptyMessage: string }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-madera/30 bg-crema p-8 text-center text-madera">
        {emptyMessage}
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
