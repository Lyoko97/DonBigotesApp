import type { Dish } from "@/types/dish";
import type { Order, OrderStatus } from "@/types/order";
import type { DailySales, DashboardSummary, SalesPeriod, TopDish } from "@/types/dashboard";
import { isInProgress, ORDER_STATUSES } from "@/lib/orderStatus";
import {
  addDaysToKey,
  roundMoney,
  startOfMonthKey,
  startOfWeekKey,
  toBusinessDateKey,
} from "@/lib/format";

const TOP_DISHES_LIMIT = 5;
const CHART_DAYS = 7;

function sumSales(orders: Order[]): SalesPeriod {
  const delivered = orders.filter((order) => order.status === "entregado");
  return {
    revenue: roundMoney(delivered.reduce((acc, order) => acc + order.total, 0)),
    orders: delivered.length,
  };
}

function computeTopDishes(orders: Order[]): TopDish[] {
  const byDish = new Map<string, TopDish>();
  for (const order of orders) {
    if (order.status === "cancelado") continue;
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
  return [...byDish.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, TOP_DISHES_LIMIT);
}

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
  // Agrupar una sola vez por día del negocio.
  const byDay = new Map<string, Order[]>();
  for (const order of orders) {
    const key = toBusinessDateKey(order.createdAt);
    const list = byDay.get(key);
    if (list) list.push(order);
    else byDay.set(key, [order]);
  }
  const ordersBetween = (fromKey: string, toKey: string) =>
    [...byDay.entries()]
      .filter(([key]) => key >= fromKey && key <= toKey)
      .flatMap(([, list]) => list);

  const todays = byDay.get(todayKey) ?? [];
  const notCancelled = todays.filter((order) => order.status !== "cancelado");
  const inProgress = todays.filter((order) => isInProgress(order.status));
  const today = sumSales(todays);

  const month = sumSales(ordersBetween(startOfMonthKey(todayKey), todayKey));
  const chartStart = addDaysToKey(todayKey, -(CHART_DAYS - 1));

  const last7Days: DailySales[] = Array.from({ length: CHART_DAYS }, (_, index) => {
    const dateKey = addDaysToKey(chartStart, index);
    return { dateKey, ...sumSales(byDay.get(dateKey) ?? []) };
  });

  const statusCounts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0])
  ) as Record<OrderStatus, number>;
  for (const order of todays) statusCounts[order.status]++;

  return {
    ordersToday: notCancelled.length,
    inProgressToday: inProgress.length,
    cancelledToday: todays.length - notCancelled.length,
    availableDishes: dishes.filter((dish) => dish.available).length,
    totalDishes: dishes.length,
    salesToday: today.orders,
    activeOrders: [...inProgress].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),

    revenueToday: today.revenue,
    pendingRevenueToday: roundMoney(inProgress.reduce((acc, order) => acc + order.total, 0)),
    week: sumSales(ordersBetween(startOfWeekKey(todayKey), todayKey)),
    month,
    averageTicketMonth: month.orders ? roundMoney(month.revenue / month.orders) : 0,
    last7Days,
    topDishes: computeTopDishes(ordersBetween(chartStart, todayKey)),
    statusCounts,
  };
}
