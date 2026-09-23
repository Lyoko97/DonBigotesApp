import type { CreateOrderInput, Order, OrderItem, OrderStatus } from "@/types/order";
import { canTransition } from "@/lib/orderStatus";
import { getTodayKey, roundMoney, startOfBusinessDay, toBusinessDateKey } from "@/lib/format";

// TODO(backend): este store en memoria simula la tabla "pedidos" (y su
// detalle "pedido_items") de PostgreSQL. Cuando exista el backend
// Node/Express de la Etapa 3, reemplazar estas funciones por consultas a la
// base de datos; las rutas de src/app/api/orders no deberían cambiar.
//
// Limitaciones conocidas mientras sea en memoria:
// - Se guarda en `globalThis` para sobrevivir a las recargas en caliente de
//   `next dev` (que re-evalúan los módulos).
// - En Vercel NO persiste: cada instancia serverless tiene su propia memoria,
//   un cold start vuelve a los pedidos semilla y dos instancias activas a la
//   vez pueden mostrar listas distintas. Tampoco comparte memoria con
//   /api/dishes, por eso los pedidos guardan su propia copia de nombre y
//   precio de cada platillo.
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

function buildItems(items: Omit<OrderItem, "subtotal">[]): OrderItem[] {
  return items.map((item) => ({
    ...item,
    subtotal: roundMoney(item.unitPrice * item.quantity),
  }));
}

function sumTotal(items: OrderItem[]): number {
  return roundMoney(items.reduce((acc, item) => acc + item.subtotal, 0));
}

// Platillos semilla de /api/dishes (mismos id, nombre y precio).
const TACOS = { dishId: "1", dishName: "Tacos al Pastor", unitPrice: 4.5 };
const POLLO = { dishId: "2", dishName: "Plato Ejecutivo de Pollo", unitPrice: 5.25 };
const HORCHATA = { dishId: "3", dishName: "Horchata Artesanal", unitPrice: 1.5 };

const ROSA = { id: "1", nombre: "Doña Rosa" };
const ENCARGADO = { id: "2", nombre: "Encargado de turno" };

function createSeedStore(): OrdersStore {
  const now = Date.now();
  const dayStart = startOfBusinessDay(getTodayKey()).getTime();
  // Los pedidos semilla se fechan "hace N minutos", sin salirse del día de
  // hoy para que siempre aparezcan en el dashboard.
  const minutesAgo = (minutes: number) =>
    new Date(Math.max(now - minutes * 60_000, dayStart)).toISOString();

  const seeds: Array<Omit<Order, "id" | "number" | "items" | "total" | "updatedAt"> & {
    items: Omit<OrderItem, "subtotal">[];
  }> = [
    {
      customerName: "Doña Marta López",
      customerPhone: "7012-3456",
      items: [
        { ...POLLO, quantity: 2 },
        { ...HORCHATA, quantity: 2 },
      ],
      status: "entregado",
      createdAt: minutesAgo(125),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Julio Ramírez",
      notes: "Para llevar",
      items: [
        { ...TACOS, quantity: 1 },
        { ...HORCHATA, quantity: 1 },
      ],
      status: "entregado",
      createdAt: minutesAgo(90),
      createdBy: ROSA,
    },
    {
      customerName: "Carlos Pérez",
      customerPhone: "6123-4567",
      notes: "Canceló por WhatsApp",
      items: [{ ...TACOS, quantity: 2 }],
      status: "cancelado",
      createdAt: minutesAgo(70),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Karla Hernández",
      customerPhone: "7788-9900",
      items: [{ ...TACOS, quantity: 3 }],
      status: "listo",
      createdAt: minutesAgo(40),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Don Chepe (mesa 2)",
      notes: "Sin cebolla",
      items: [{ ...POLLO, quantity: 1 }],
      status: "en_preparacion",
      createdAt: minutesAgo(20),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Andrea Martínez",
      customerPhone: "7234-5678",
      items: [
        { ...POLLO, quantity: 1 },
        { ...HORCHATA, quantity: 2 },
      ],
      status: "pendiente",
      createdAt: minutesAgo(5),
      createdBy: ENCARGADO,
    },
  ];

  const orders = seeds.map((seed, index): Order => {
    const items = buildItems(seed.items);
    return {
      ...seed,
      id: `seed-${index + 1}`,
      number: index + 1,
      items,
      total: sumTotal(items),
      updatedAt: seed.createdAt,
    };
  });

  return { orders, nextNumber: orders.length + 1 };
}

function getStore(): OrdersStore {
  globalForOrders.__donBigotesOrdersStore ??= createSeedStore();
  return globalForOrders.__donBigotesOrdersStore;
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
    notes: input.notes,
    items,
    total: sumTotal(items),
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
