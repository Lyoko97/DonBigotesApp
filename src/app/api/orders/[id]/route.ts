import { NextResponse, type NextRequest } from "next/server";
import { deleteOrder, updateOrderStatus } from "@/lib/ordersStore";
import { isOrderStatus, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { getSessionUserId, unauthorizedResponse } from "@/lib/apiSession";

const NOT_FOUND_MESSAGE = "El pedido no existe o ya fue eliminado.";

// PATCH /api/orders/:id — cambia el estado ({ status }). Cancelar un pedido
// es pasarlo a "cancelado": se conserva en el historial pero no cuenta en
// las ventas.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  if (!getSessionUserId(request)) return unauthorizedResponse();
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  const status =
    typeof body === "object" && body !== null ? (body as { status?: unknown }).status : undefined;
  if (!isOrderStatus(status)) {
    return NextResponse.json({ error: "Estado de pedido no válido." }, { status: 400 });
  }

  const result = updateOrderStatus(id, status);
  if (!result.ok) {
    if (result.reason === "not_found") {
      return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    }
    return NextResponse.json(
      {
        error: `No se puede pasar un pedido de "${ORDER_STATUS_LABELS[result.from]}" a "${ORDER_STATUS_LABELS[status]}".`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ order: result.order });
}

// DELETE /api/orders/:id — borrado definitivo.
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  if (!getSessionUserId(request)) return unauthorizedResponse();
  const { id } = await ctx.params;

  // TODO(auth): el borrado definitivo es exclusivo del rol admin. La cookie
  // donbigotes_session solo guarda el id del usuario (ver persistSession en
  // src/lib/auth.ts), no su rol, así que aquí no se puede responder 403 de
  // forma confiable; por ahora el permiso se aplica en la UI (solo el admin
  // ve el botón). Cuando la sesión sea un JWT firmado que incluya el rol,
  // responder 403 aquí si role !== "admin".

  if (!deleteOrder(id)) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }
  return NextResponse.json({ message: "Pedido eliminado." });
}
