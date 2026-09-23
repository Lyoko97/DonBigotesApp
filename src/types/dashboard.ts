import type { Order, OrderStatus } from "@/types/order";

export interface TopDish {
  dishId: string;
  dishName: string;
  quantity: number;
  revenue: number;
}

export interface SalesPeriod {
  revenue: number; // Suma de pedidos entregados
  orders: number; // Pedidos entregados
}

export interface DailySales extends SalesPeriod {
  dateKey: string; // "YYYY-MM-DD"
}

export interface DashboardSummary {
  // Para todos los roles
  ordersToday: number; // Pedidos del día sin contar cancelados
  inProgressToday: number; // Pendientes + en preparación + listos
  cancelledToday: number;
  availableDishes: number;
  totalDishes: number;
  salesToday: number; // Pedidos entregados hoy
  activeOrders: Order[]; // En curso, el más antiguo primero

  // Solo admin
  revenueToday: number;
  pendingRevenueToday: number; // Suma de pedidos en curso (por cobrar)
  week: SalesPeriod; // Lunes de esta semana → hoy
  month: SalesPeriod; // Día 1 del mes → hoy
  averageTicketMonth: number;
  last7Days: DailySales[]; // Del más antiguo a hoy
  topDishes: TopDish[]; // Últimos 7 días
  statusCounts: Record<OrderStatus, number>; // Hoy
}
