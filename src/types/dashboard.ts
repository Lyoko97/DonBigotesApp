import type { Order } from "@/types/order";

export interface TopDish {
  dishId: string;
  dishName: string;
  quantity: number;
  revenue: number;
}

export interface DashboardSummary {
  ordersToday: number; // Pedidos del día sin contar cancelados
  inProgressToday: number; // Pendientes + en preparación + listos
  cancelledToday: number;
  availableDishes: number;
  totalDishes: number;
  salesToday: number; // Pedidos entregados
  revenueToday: number; // Suma de pedidos entregados
  pendingRevenueToday: number; // Suma de pedidos en curso (por cobrar)
  averageTicket: number;
  topDishes: TopDish[];
  recentOrders: Order[];
}
