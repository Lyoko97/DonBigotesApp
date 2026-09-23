import axios from "axios";
import type { Dish } from "@/types/dish";

// Solo lectura del menú (API de Persona 2) para armar pedidos y el
// dashboard. La gestión de platillos sigue viviendo en /menu.
export async function fetchDishes(): Promise<Dish[]> {
  const { data } = await axios.get<Dish[]>("/api/dishes", {
    headers: { "Cache-Control": "no-cache" },
  });
  return data;
}
