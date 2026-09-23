import type {
  CreateOrderInput,
  CreateOrderItemInput,
  DeliveryType,
  OrderAuthor,
  OrderFieldErrors,
  PaymentMethod,
} from "@/types/order";
import {
  CARD_NOT_ALLOWED_MESSAGE,
  isDeliveryType,
  isPaymentAllowed,
  isPaymentMethod,
} from "@/lib/orderStatus";

// Reglas compartidas por el formulario (cliente) y por /api/orders
// (servidor), para que ambos lados validen exactamente lo mismo.
export const ORDER_LIMITS = {
  customerNameMin: 2,
  customerNameMax: 60,
  addressMin: 10,
  addressMax: 150,
  notesMax: 200,
  maxQuantityPerItem: 50,
  maxItems: 20,
};

// Teléfonos de El Salvador: 8 dígitos, fijos empiezan con 2 y móviles con
// 6 o 7. Se aceptan con o sin guion/espacios ("7012-3456", "7012 3456").
const PHONE_REGEX = /^[267]\d{7}$/;

function stripPhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export function normalizePhone(phone: string): string {
  const digits = stripPhone(phone);
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function validateCustomerName(name: string): string | null {
  const value = name.trim();
  if (!value) return "El nombre del cliente es obligatorio.";
  if (value.length < ORDER_LIMITS.customerNameMin) {
    return `El nombre debe tener al menos ${ORDER_LIMITS.customerNameMin} caracteres.`;
  }
  if (value.length > ORDER_LIMITS.customerNameMax) {
    return `El nombre no puede pasar de ${ORDER_LIMITS.customerNameMax} caracteres.`;
  }
  return null;
}

// El teléfono es opcional en el local y para llevar, pero obligatorio a
// domicilio (el repartidor necesita contactar al cliente). Si se escribe,
// siempre debe ser válido.
export function validateCustomerPhone(phone: string, required = false): string | null {
  if (!phone.trim()) {
    return required ? "El teléfono es obligatorio para pedidos a domicilio." : null;
  }
  if (!PHONE_REGEX.test(stripPhone(phone))) {
    return "Ingresa un teléfono válido de 8 dígitos (ej. 7012-3456).";
  }
  return null;
}

export function validateDeliveryAddress(
  address: string,
  deliveryType: DeliveryType
): string | null {
  if (deliveryType !== "domicilio") return null;
  const value = address.trim();
  if (!value) return "La dirección es obligatoria para pedidos a domicilio.";
  if (value.length < ORDER_LIMITS.addressMin) {
    return "Escribe una dirección más completa (colonia, pasaje, número de casa).";
  }
  if (value.length > ORDER_LIMITS.addressMax) {
    return `La dirección no puede pasar de ${ORDER_LIMITS.addressMax} caracteres.`;
  }
  return null;
}

export function validatePaymentMethod(
  deliveryType: DeliveryType,
  paymentMethod: PaymentMethod
): string | null {
  return isPaymentAllowed(deliveryType, paymentMethod) ? null : CARD_NOT_ALLOWED_MESSAGE;
}

export function validateNotes(notes: string): string | null {
  if (notes.trim().length > ORDER_LIMITS.notesMax) {
    return `Las notas no pueden pasar de ${ORDER_LIMITS.notesMax} caracteres.`;
  }
  return null;
}

export function validateItems(items: CreateOrderItemInput[]): string | null {
  if (items.length === 0) return "Agrega al menos un platillo al pedido.";
  if (items.length > ORDER_LIMITS.maxItems) {
    return `Un pedido no puede tener más de ${ORDER_LIMITS.maxItems} platillos distintos.`;
  }

  const seen = new Set<string>();
  for (const item of items) {
    if (!item.dishId || !item.dishName.trim()) {
      return "Hay un platillo inválido en el pedido.";
    }
    if (seen.has(item.dishId)) return `"${item.dishName}" está repetido en el pedido.`;
    seen.add(item.dishId);

    if (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0) {
      return `El precio de "${item.dishName}" no es válido.`;
    }
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > ORDER_LIMITS.maxQuantityPerItem
    ) {
      return `La cantidad de "${item.dishName}" debe estar entre 1 y ${ORDER_LIMITS.maxQuantityPerItem}.`;
    }
  }
  return null;
}

export function validateCreateOrderInput(input: CreateOrderInput): OrderFieldErrors {
  const errors: OrderFieldErrors = {};
  const isDelivery = input.deliveryType === "domicilio";
  const customerName = validateCustomerName(input.customerName);
  const customerPhone = validateCustomerPhone(input.customerPhone ?? "", isDelivery);
  const deliveryAddress = validateDeliveryAddress(input.deliveryAddress ?? "", input.deliveryType);
  const paymentMethod = validatePaymentMethod(input.deliveryType, input.paymentMethod);
  const notes = validateNotes(input.notes ?? "");
  const items = validateItems(input.items);

  if (customerName) errors.customerName = customerName;
  if (customerPhone) errors.customerPhone = customerPhone;
  if (deliveryAddress) errors.deliveryAddress = deliveryAddress;
  if (paymentMethod) errors.paymentMethod = paymentMethod;
  if (notes) errors.notes = notes;
  if (items) errors.items = items;
  if (!input.createdBy.id || !input.createdBy.nombre.trim()) {
    errors.general = "No se pudo identificar al usuario que registra el pedido.";
  }
  return errors;
}

export function hasErrors(errors: OrderFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

// --- Validación del lado del servidor -------------------------------------
// El body de una petición es `unknown`: primero se comprueba la forma y los
// tipos, y luego se aplican las mismas reglas que en el formulario.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseItem(value: unknown): CreateOrderItemInput | null {
  if (!isRecord(value)) return null;
  const { dishId, dishName, unitPrice, quantity } = value;
  if (typeof dishId !== "string" || typeof dishName !== "string") return null;
  if (typeof unitPrice !== "number" || typeof quantity !== "number") return null;
  return { dishId, dishName: dishName.trim(), unitPrice, quantity };
}

function parseAuthor(value: unknown): OrderAuthor {
  if (!isRecord(value)) return { id: "", nombre: "" };
  return {
    id: typeof value.id === "string" ? value.id : "",
    nombre: typeof value.nombre === "string" ? value.nombre.trim() : "",
  };
}

export type ParseOrderResult =
  | { data: CreateOrderInput; errors: null }
  | { data: null; errors: OrderFieldErrors };

export function parseCreateOrderBody(body: unknown): ParseOrderResult {
  if (!isRecord(body)) {
    return { data: null, errors: { general: "El cuerpo de la petición no es válido." } };
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.map(parseItem);
  if (items.some((item) => item === null)) {
    return { data: null, errors: { items: "Hay un platillo con datos incompletos." } };
  }

  const { deliveryType, paymentMethod } = body;
  if (!isDeliveryType(deliveryType)) {
    return { data: null, errors: { deliveryType: "Elige un tipo de entrega válido." } };
  }
  if (!isPaymentMethod(paymentMethod)) {
    return { data: null, errors: { paymentMethod: "Elige un método de pago válido." } };
  }

  const customerPhone = optionalString(body.customerPhone);
  const input: CreateOrderInput = {
    customerName: typeof body.customerName === "string" ? body.customerName.trim() : "",
    customerPhone,
    deliveryType,
    // La dirección solo se guarda en pedidos a domicilio.
    deliveryAddress: deliveryType === "domicilio" ? optionalString(body.deliveryAddress) : undefined,
    paymentMethod,
    notes: optionalString(body.notes),
    items: items as CreateOrderItemInput[],
    createdBy: parseAuthor(body.createdBy),
  };

  const errors = validateCreateOrderInput(input);
  if (hasErrors(errors)) return { data: null, errors };

  return {
    data: { ...input, customerPhone: customerPhone ? normalizePhone(customerPhone) : undefined },
    errors: null,
  };
}
