import type { Dish } from "@/types/dish";
import type { Order } from "@/types/order";
import type { DashboardSummary, TopDish } from "@/types/dashboard";
import { isInProgress } from "@/lib/orderStatus";
import { roundMoney, toBusinessDateKey } from "@/lib/format";

const TOP_DISHES_LIMIT = 5;
const RECENT_ORDERS_LIMIT = 5;

// El resumen se calcula en el cliente a partir de /api/orders y
// /api/dishes: en Vercel cada ruta puede vivir en una instancia distinta, así
// que un endpoint de servidor no podría leer ambos stores en memoria.
// TODO(backend): con la base de datos real, mover este cálculo a un
// endpoint (ej. GET /api/dashboard) con consultas agregadas.
export function computeDashboardSummary(
  orders: Order[],
  dishes: Dish[],
  todayKey: string
): DashboardSummary {
  const todays = orders.filter((order) => toBusinessDateKey(order.createdAt) === todayKey);
  const notCancelled = todays.filter((order) => order.status !== "cancelado");
  const delivered = todays.filter((order) => order.status === "entregado");
  const inProgress = todays.filter((order) => isInProgress(order.status));

  const revenueToday = roundMoney(delivered.reduce((acc, order) => acc + order.total, 0));
  const pendingRevenueToday = roundMoney(inProgress.reduce((acc, order) => acc + order.total, 0));

  // Más vendidos: todo lo pedido hoy que no se canceló (entregado o en curso).
  const byDish = new Map<string, TopDish>();
  for (const order of notCancelled) {
    for (const item of order.items) {
      const entry = byDish.get(item.dishId) ?? {
        dishId: item.dishId,
        dishName: item.dishName,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue = roundMoney(entry.revenue + item.subtotal);
      byDish.set(item.dishId, entry);
    }
  }
  const topDishes = [...byDish.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, TOP_DISHES_LIMIT);

  return {
    ordersToday: notCancelled.length,
    inProgressToday: inProgress.length,
    cancelledToday: todays.length - notCancelled.length,
    availableDishes: dishes.filter((dish) => dish.available).length,
    totalDishes: dishes.length,
    salesToday: delivered.length,
    revenueToday,
    pendingRevenueToday,
    averageTicket: delivered.length ? roundMoney(revenueToday / delivered.length) : 0,
    topDishes,
    recentOrders: [...todays]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, RECENT_ORDERS_LIMIT),
  };
}
