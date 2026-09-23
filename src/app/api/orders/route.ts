import { NextResponse, type NextRequest } from "next/server";
import type { OrderStatus } from "@/types/order";
import { createOrder, listOrders } from "@/lib/ordersStore";
import { isOrderStatus } from "@/lib/orderStatus";
import { parseCreateOrderBody } from "@/lib/orderValidation";
import { getTodayKey } from "@/lib/format";
import { getSessionUserId, unauthorizedResponse } from "@/lib/apiSession";

// Los pedidos cambian a cada rato y el cliente hace polling: nunca cachear.
const NO_STORE = { "Cache-Control": "no-store" };
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/orders?status=pendiente&date=today|YYYY-MM-DD
export async function GET(request: NextRequest) {
  if (!getSessionUserId(request)) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;

  let status: OrderStatus | undefined;
  const statusParam = searchParams.get("status");
  if (statusParam) {
    if (!isOrderStatus(statusParam)) {
      return NextResponse.json({ error: "Estado de pedido no válido." }, { status: 400 });
    }
    status = statusParam;
  }

  let dateKey: string | undefined;
  const dateParam = searchParams.get("date");
  if (dateParam) {
    if (dateParam !== "today" && !DATE_KEY_REGEX.test(dateParam)) {
      return NextResponse.json(
        { error: "La fecha debe ser 'today' o tener el formato AAAA-MM-DD." },
        { status: 400 }
      );
    }
    dateKey = dateParam === "today" ? getTodayKey() : dateParam;
  }

  return NextResponse.json({ orders: listOrders({ status, dateKey }) }, { headers: NO_STORE });
}

// POST /api/orders — registra un pedido nuevo en estado "pendiente".
export async function POST(request: NextRequest) {
  if (!getSessionUserId(request)) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  const parsed = parseCreateOrderBody(body);
  if (parsed.errors) {
    return NextResponse.json(
      { error: "Revisa los datos del pedido.", fieldErrors: parsed.errors },
      { status: 400 }
    );
  }

  // TODO(backend): con la base de datos real, validar aquí contra la tabla
  // de platillos que cada uno exista, esté disponible y tenga el precio
  // enviado. Hoy /api/dishes vive en otra memoria y no se puede consultar
  // de forma confiable desde esta ruta; la UI solo ofrece platillos
  // disponibles.
  const order = createOrder(parsed.data);
  return NextResponse.json({ order }, { status: 201 });
}
