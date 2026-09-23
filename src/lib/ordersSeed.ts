import type {
  DeliveryType,
  Order,
  OrderAuthor,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/types/order";
import {
  addDaysToKey,
  getTodayKey,
  roundMoney,
  startOfBusinessDay,
} from "@/lib/format";

// Datos de ejemplo para la demo mientras no exista la base de datos:
// - Pedidos de hoy en todos los estados, para probar el flujo de comandas.
// - Historial de las últimas 5 semanas (entregados y algunos cancelados) para
//   que el dashboard tenga ventas de la semana, del mes y el gráfico de 7 días.
//
// El historial es determinista (mismo generador pseudoaleatorio con la misma
// semilla por día), así que cada instancia de Vercel genera exactamente el
// mismo historial tras un cold start.

const HISTORY_DAYS = 35;

// Platillos semilla de /api/dishes (mismos id, nombre y precio).
const TACOS = { dishId: "1", dishName: "Tacos al Pastor", unitPrice: 4.5 };
const POLLO = { dishId: "2", dishName: "Plato Ejecutivo de Pollo", unitPrice: 5.25 };
const HORCHATA = { dishId: "3", dishName: "Horchata Artesanal", unitPrice: 1.5 };
const FLAN = { dishId: "4", dishName: "Flan de la Casa", unitPrice: 2.0 };
// Peso relativo de cada platillo en el historial (el pollo es el más pedido).
const WEIGHTED_DISHES = [POLLO, POLLO, POLLO, TACOS, TACOS, HORCHATA, HORCHATA, FLAN];

const ROSA: OrderAuthor = { id: "1", nombre: "Doña Rosa" };
const ENCARGADO: OrderAuthor = { id: "2", nombre: "Encargado de turno" };

const CUSTOMERS = [
  "Doña Marta López",
  "Julio Ramírez",
  "Karla Hernández",
  "Don Chepe",
  "Andrea Martínez",
  "Carlos Pérez",
  "Rosa Elena Guzmán",
  "Kevin Alvarado",
  "Niña Toña",
  "Mario Flores",
  "Gabriela Rivas",
  "José Ernesto Mejía",
];

const ADDRESSES = [
  "Col. Las Brisas, pasaje 3, casa #12",
  "Col. Las Brisas, calle principal, casa #45",
  "Res. Montes de San Bartolo, block C, casa #8",
  "Col. Guadalupe, avenida Los Almendros #21",
];

type SeedOrder = Omit<Order, "id" | "number" | "items" | "total" | "updatedAt"> & {
  items: Omit<OrderItem, "subtotal">[];
};

function toOrder(seed: SeedOrder, id: string): Omit<Order, "number"> {
  const items = seed.items.map((item) => ({
    ...item,
    subtotal: roundMoney(item.unitPrice * item.quantity),
  }));
  return {
    ...seed,
    id,
    items,
    total: roundMoney(items.reduce((acc, item) => acc + item.subtotal, 0)),
    updatedAt: seed.createdAt,
  };
}

// Generador pseudoaleatorio pequeño (mulberry32) con semilla fija.
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashKey(dateKey: string): number {
  return [...dateKey].reduce((acc, char) => Math.imul(acc ^ char.charCodeAt(0), 16777619), 2166136261);
}

// Celular salvadoreño de ejemplo: "7xxx-xxxx".
function randomPhone(random: () => number): string {
  const digits = (length: number) =>
    String(Math.floor(random() * 10 ** length)).padStart(length, "0");
  return `7${digits(3)}-${digits(4)}`;
}

function createHistoryForDay(dateKey: string): Omit<Order, "number">[] {
  const random = createRandom(hashKey(dateKey));
  const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)];
  const isSunday = new Date(`${dateKey}T00:00:00Z`).getUTCDay() === 0;
  const count = (isSunday ? 3 : 5) + Math.floor(random() * 5);
  // El comedor atiende de 11:00 a 19:00, hora de El Salvador.
  const openingMs = startOfBusinessDay(dateKey).getTime() + 11 * 3_600_000;

  const orders: Omit<Order, "number">[] = [];
  for (let i = 0; i < count; i++) {
    const deliveryRoll = random();
    const deliveryType: DeliveryType =
      deliveryRoll < 0.5 ? "local" : deliveryRoll < 0.75 ? "para_llevar" : "domicilio";
    const paymentMethod: PaymentMethod =
      deliveryType !== "domicilio" && random() < 0.3 ? "tarjeta" : "efectivo";
    const status: OrderStatus = random() < 0.1 ? "cancelado" : "entregado";

    const items = new Map<string, Omit<OrderItem, "subtotal">>();
    const lines = 1 + Math.floor(random() * 3);
    for (let line = 0; line < lines; line++) {
      const dish = pick(WEIGHTED_DISHES);
      const current = items.get(dish.dishId);
      const quantity = 1 + Math.floor(random() * 2);
      items.set(dish.dishId, { ...dish, quantity: (current?.quantity ?? 0) + quantity });
    }

    const seed: SeedOrder = {
      customerName: pick(CUSTOMERS),
      customerPhone:
        deliveryType === "domicilio" || random() < 0.4 ? randomPhone(random) : undefined,
      deliveryType,
      deliveryAddress: deliveryType === "domicilio" ? pick(ADDRESSES) : undefined,
      paymentMethod,
      notes: status === "cancelado" ? "Cliente canceló" : undefined,
      items: [...items.values()],
      status,
      createdAt: new Date(openingMs + Math.floor(random() * 8 * 3_600_000)).toISOString(),
      createdBy: random() < 0.3 ? ROSA : ENCARGADO,
    };
    orders.push(toOrder(seed, `hist-${dateKey}-${i + 1}`));
  }
  return orders;
}

function createTodayOrders(todayKey: string): Omit<Order, "number">[] {
  const now = Date.now();
  const dayStart = startOfBusinessDay(todayKey).getTime();
  // "Hace N minutos", sin salirse del día de hoy para que siempre aparezcan
  // en el dashboard.
  const minutesAgo = (minutes: number) =>
    new Date(Math.max(now - minutes * 60_000, dayStart)).toISOString();

  const seeds: SeedOrder[] = [
    {
      customerName: "Doña Marta López",
      customerPhone: "7012-3456",
      deliveryType: "local",
      paymentMethod: "tarjeta",
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
      deliveryType: "para_llevar",
      paymentMethod: "efectivo",
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
      deliveryType: "domicilio",
      deliveryAddress: "Col. Las Brisas, pasaje 3, casa #12",
      paymentMethod: "efectivo",
      notes: "Canceló por WhatsApp",
      items: [{ ...TACOS, quantity: 2 }],
      status: "cancelado",
      createdAt: minutesAgo(70),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Karla Hernández",
      customerPhone: "7788-9900",
      deliveryType: "domicilio",
      deliveryAddress: "Res. Montes de San Bartolo, block C, casa #8",
      paymentMethod: "efectivo",
      notes: "Lleva cambio de $20",
      items: [{ ...TACOS, quantity: 3 }],
      status: "listo",
      createdAt: minutesAgo(40),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Don Chepe (mesa 2)",
      deliveryType: "local",
      paymentMethod: "efectivo",
      notes: "Sin cebolla",
      items: [{ ...POLLO, quantity: 1 }],
      status: "en_preparacion",
      createdAt: minutesAgo(20),
      createdBy: ENCARGADO,
    },
    {
      customerName: "Andrea Martínez",
      customerPhone: "7234-5678",
      deliveryType: "para_llevar",
      paymentMethod: "tarjeta",
      items: [
        { ...POLLO, quantity: 1 },
        { ...HORCHATA, quantity: 2 },
      ],
      status: "pendiente",
      createdAt: minutesAgo(5),
      createdBy: ENCARGADO,
    },
  ];

  return seeds.map((seed, index) => toOrder(seed, `seed-${index + 1}`));
}

// Historial + pedidos de hoy, numerados en orden cronológico.
export function createSeedOrders(): Order[] {
  const todayKey = getTodayKey();
  const history: Omit<Order, "number">[] = [];
  for (let daysAgo = HISTORY_DAYS; daysAgo >= 1; daysAgo--) {
    history.push(...createHistoryForDay(addDaysToKey(todayKey, -daysAgo)));
  }

  return [...history, ...createTodayOrders(todayKey)]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((order, index) => ({ ...order, number: index + 1 }));
}
