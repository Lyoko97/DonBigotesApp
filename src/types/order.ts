import type { Dish } from "@/types/dish";

// Flujo de una comanda: pendiente → en_preparacion → listo → entregado.
// "cancelado" es un estado final al que se llega desde cualquier estado en
// curso (ver transiciones en src/lib/orderStatus.ts).
export type OrderStatus =
  | "pendiente"
  | "en_preparacion"
  | "listo"
  | "entregado"
  | "cancelado";

// Cada línea guarda una copia del nombre y precio del platillo al momento
// del pedido: si luego el menú cambia o el platillo se elimina, el historial
// y los totales del día no se alteran.
export interface OrderItem {
  dishId: string;
  dishName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderAuthor {
  id: string;
  nombre: string;
}

export interface Order {
  id: string;
  number: number; // Número corto y legible de la comanda (#0001)
  customerName: string;
  customerPhone?: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: OrderAuthor;
}

export type CreateOrderItemInput = Omit<OrderItem, "subtotal">;

export interface CreateOrderInput {
  customerName: string;
  customerPhone?: string;
  notes?: string;
  items: CreateOrderItemInput[];
  createdBy: OrderAuthor;
}

export type OrderField = "customerName" | "customerPhone" | "notes" | "items" | "general";

export type OrderFieldErrors = Partial<Record<OrderField, string>>;

export interface OrderActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: OrderFieldErrors;
}

export interface OrdersContextValue {
  orders: Order[];
  dishes: Dish[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  // Fecha del negocio ("YYYY-MM-DD" en hora de El Salvador) de la última
  // sincronización; null hasta que termina la primera carga.
  todayKey: string | null;
  refresh: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<OrderActionResult>;
  updateStatus: (id: string, status: OrderStatus) => Promise<OrderActionResult>;
  cancelOrder: (id: string) => Promise<OrderActionResult>;
  deleteOrder: (id: string) => Promise<OrderActionResult>;
}
