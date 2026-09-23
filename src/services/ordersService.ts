import axios from "axios";
import type { CreateOrderInput, Order, OrderStatus } from "@/types/order";

// Capa de acceso a la API REST de pedidos. Cuando exista el backend real de
// la Etapa 3 solo debería cambiar la URL base.
const BASE_URL = "/api/orders";

export interface FetchOrdersParams {
  status?: OrderStatus;
  date?: string; // "today" o "AAAA-MM-DD"
}

export async function fetchOrders(params?: FetchOrdersParams): Promise<Order[]> {
  const { data } = await axios.get<{ orders: Order[] }>(BASE_URL, { params });
  return data.orders;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await axios.post<{ order: Order }>(BASE_URL, input);
  return data.order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await axios.patch<{ order: Order }>(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    { status }
  );
  return data.order;
}

export async function deleteOrder(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${encodeURIComponent(id)}`);
}
