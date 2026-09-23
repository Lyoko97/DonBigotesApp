import type { CreateOrderInput, Order, OrderItem, OrderStatus } from "@/types/order";
import { canTransition } from "@/lib/orderStatus";
import { roundMoney, toBusinessDateKey } from "@/lib/format";
import { createSeedOrders } from "@/lib/ordersSeed";

// TODO(backend): este store en memoria simula la tabla "pedidos" (y su
// detalle "pedido_items") de PostgreSQL. Cuando exista el backend
// Node/Express de la Etapa 3, reemplazar estas funciones por consultas a la
// base de datos; las rutas de src/app/api/orders no deberían cambiar.
//
// Limitaciones conocidas mientras sea en memoria:
// - Se guarda en `globalThis` para sobrevivir a las recargas en caliente de
//   `next dev` (que re-evalúan los módulos).
// - En Vercel NO persiste: cada instancia serverless tiene su propia memoria,
//   un cold start vuelve a los pedidos semilla (src/lib/ordersSeed.ts) y dos
//   instancias activas a la vez pueden mostrar listas distintas. Tampoco
//   comparte memoria con /api/dishes, por eso los pedidos guardan su propia
//   copia de nombre y precio de cada platillo.
//
// TODO(stock): registrar un pedido todavía no descuenta el `stock` del
// platillo. Hacerlo en una transacción junto con la inserción del pedido
// cuando exista la base de datos real.

interface OrdersStore {
  orders: Order[];
  nextNumber: number;
}

const globalForOrders = globalThis as typeof globalThis & {
  __donBigotesOrdersStore?: OrdersStore;
};

function getStore(): OrdersStore {
  if (!globalForOrders.__donBigotesOrdersStore) {
    const orders = createSeedOrders();
    globalForOrders.__donBigotesOrdersStore = { orders, nextNumber: orders.length + 1 };
  }
  return globalForOrders.__donBigotesOrdersStore;
}

function buildItems(items: Omit<OrderItem, "subtotal">[]): OrderItem[] {
  return items.map((item) => ({
    ...item,
    subtotal: roundMoney(item.unitPrice * item.quantity),
  }));
}

export interface OrderFilters {
  status?: OrderStatus;
  dateKey?: string; // "YYYY-MM-DD" en hora de El Salvador
}

// Más recientes primero.
export function listOrders(filters: OrderFilters = {}): Order[] {
  return getStore()
    .orders.filter((order) => !filters.status || order.status === filters.status)
    .filter((order) => !filters.dateKey || toBusinessDateKey(order.createdAt) === filters.dateKey)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createOrder(input: CreateOrderInput): Order {
  const store = getStore();
  const items = buildItems(input.items);
  const timestamp = new Date().toISOString();

  const order: Order = {
    id: `ped-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    number: store.nextNumber++,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryType: input.deliveryType,
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    items,
    total: roundMoney(items.reduce((acc, item) => acc + item.subtotal, 0)),
    status: "pendiente",
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: input.createdBy,
  };

  store.orders = [...store.orders, order];
  return order;
}

export type UpdateStatusResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "invalid_transition"; from: OrderStatus };

export function updateOrderStatus(id: string, status: OrderStatus): UpdateStatusResult {
  const store = getStore();
  const current = store.orders.find((order) => order.id === id);
  if (!current) return { ok: false, reason: "not_found" };
  if (!canTransition(current.status, status)) {
    return { ok: false, reason: "invalid_transition", from: current.status };
  }

  const updated: Order = { ...current, status, updatedAt: new Date().toISOString() };
  store.orders = store.orders.map((order) => (order.id === id ? updated : order));
  return { ok: true, order: updated };
}

export function deleteOrder(id: string): boolean {
  const store = getStore();
  const exists = store.orders.some((order) => order.id === id);
  if (exists) {
    store.orders = store.orders.filter((order) => order.id !== id);
  }
  return exists;
}
