"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CreateOrderInput,
  Order,
  OrderActionResult,
  OrdersContextValue,
  OrderStatus,
} from "@/types/order";
import type { Dish } from "@/types/dish";
import * as ordersService from "@/services/ordersService";
import { fetchDishes } from "@/services/dishesService";
import { getApiErrorMessage, getApiFieldErrors } from "@/services/apiError";
import { usePolling } from "@/hooks/usePolling";
import { toBusinessDateKey } from "@/lib/format";

// Cada cuánto se sincronizan pedidos y menú mientras la pestaña está visible.
export const ORDERS_POLL_INTERVAL_MS = 10_000;

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // El polling y la revalidación tras una acción pueden solaparse; solo se
  // aplica la respuesta de la petición más reciente para no pintar datos
  // viejos encima de los nuevos.
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setIsRefreshing(true);
    try {
      const [nextOrders, nextDishes] = await Promise.all([
        ordersService.fetchOrders(),
        fetchDishes(),
      ]);
      if (requestId !== latestRequest.current) return;
      setOrders(nextOrders);
      setDishes(nextDishes);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      // Se conservan los últimos datos buenos y solo se avisa del error.
      setError(getApiErrorMessage(err, "No se pudieron actualizar los pedidos."));
    } finally {
      if (requestId === latestRequest.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Carga inicial + sincronización periódica.
  usePolling(refresh, ORDERS_POLL_INTERVAL_MS);

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<OrderActionResult> => {
      try {
        await ordersService.createOrder(input);
        await refresh();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: getApiErrorMessage(err, "No se pudo registrar el pedido."),
          fieldErrors: getApiFieldErrors(err),
        };
      }
    },
    [refresh]
  );

  // Actualización optimista: la tarjeta cambia de estado al instante y, si
  // el servidor rechaza el cambio o no responde, se revierte al estado
  // anterior.
  const updateStatus = useCallback(
    async (id: string, status: OrderStatus): Promise<OrderActionResult> => {
      const previous = orders.find((order) => order.id === id);
      if (!previous) {
        return { success: false, error: "El pedido no existe o ya fue eliminado." };
      }

      // Cualquier sincronización en curso trae datos anteriores a este
      // cambio: se invalida para que no pise el estado optimista.
      latestRequest.current++;
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order
        )
      );

      try {
        const saved = await ordersService.updateOrderStatus(id, status);
        setOrders((current) => current.map((order) => (order.id === id ? saved : order)));
        void refresh();
        return { success: true };
      } catch (err) {
        // Rollback: solo si nadie más cambió ese pedido mientras tanto.
        setOrders((current) =>
          current.map((order) =>
            order.id === id && order.status === status ? previous : order
          )
        );
        // Si otro usuario ya lo movió (409), refrescar muestra el estado real.
        void refresh();
        return {
          success: false,
          error: getApiErrorMessage(err, "No se pudo actualizar el pedido."),
        };
      }
    },
    [orders, refresh]
  );

  const cancelOrder = useCallback(
    (id: string) => updateStatus(id, "cancelado"),
    [updateStatus]
  );

  const deleteOrder = useCallback(
    async (id: string): Promise<OrderActionResult> => {
      try {
        await ordersService.deleteOrder(id);
        await refresh();
        return { success: true };
      } catch (err) {
        await refresh();
        return {
          success: false,
          error: getApiErrorMessage(err, "No se pudo eliminar el pedido."),
        };
      }
    },
    [refresh]
  );

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      dishes,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      todayKey: lastUpdated ? toBusinessDateKey(lastUpdated) : null,
      refresh,
      createOrder,
      updateStatus,
      cancelOrder,
      deleteOrder,
    }),
    [
      orders,
      dishes,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      refresh,
      createOrder,
      updateStatus,
      cancelOrder,
      deleteOrder,
    ]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders debe usarse dentro de un <OrdersProvider>.");
  }
  return ctx;
}
