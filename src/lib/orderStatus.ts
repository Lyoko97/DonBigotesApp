import type { OrderStatus } from "@/types/order";

export const ORDER_STATUSES: OrderStatus[] = [
  "pendiente",
  "en_preparacion",
  "listo",
  "entregado",
  "cancelado",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  listo: "Listo para entregar",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// Texto del botón que lleva un pedido a este estado.
export const ORDER_STATUS_ACTION_LABELS: Record<OrderStatus, string> = {
  pendiente: "Volver a pendiente",
  en_preparacion: "Pasar a preparación",
  listo: "Marcar como listo",
  entregado: "Marcar entregado",
  cancelado: "Cancelar pedido",
};

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ["en_preparacion", "cancelado"],
  en_preparacion: ["listo", "cancelado"],
  listo: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as string[]).includes(value);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// Siguiente paso "normal" del flujo (sin contar la cancelación).
export function getNextStatus(status: OrderStatus): OrderStatus | null {
  return TRANSITIONS[status].find((next) => next !== "cancelado") ?? null;
}

// Pedidos que la cocina todavía tiene que atender.
export function isInProgress(status: OrderStatus): boolean {
  return status === "pendiente" || status === "en_preparacion" || status === "listo";
}
