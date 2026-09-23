"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // El polling y la revalidación tras una acción pueden solaparse; solo se
  // aplica la respuesta de la petición más reciente para no pintar datos
  // viejos encima de los nuevos.
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;
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
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  const updateStatus = useCallback(
    async (id: string, status: OrderStatus): Promise<OrderActionResult> => {
      try {
        await ordersService.updateOrderStatus(id, status);
        await refresh();
        return { success: true };
      } catch (err) {
        // Si otro usuario ya lo movió, refrescar muestra el estado real.
        await refresh();
        return {
          success: false,
          error: getApiErrorMessage(err, "No se pudo actualizar el pedido."),
        };
      }
    },
    [refresh]
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
      error,
      lastUpdated,
      todayKey: lastUpdated ? toBusinessDateKey(lastUpdated) : null,
      refresh,
      createOrder,
      updateStatus,
      cancelOrder,
      deleteOrder,
    }),
    [orders, dishes, isLoading, error, lastUpdated, refresh, createOrder, updateStatus, cancelOrder, deleteOrder]
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
