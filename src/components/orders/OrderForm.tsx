"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import type {
  CreateOrderInput,
  DeliveryType,
  OrderFieldErrors,
  PaymentMethod,
} from "@/types/order";
import { hasErrors, ORDER_LIMITS, validateCreateOrderInput } from "@/lib/orderValidation";
import {
  CARD_NOT_ALLOWED_MESSAGE,
  DELIVERY_TYPE_LABELS,
  DELIVERY_TYPES,
  isPaymentAllowed,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from "@/lib/orderStatus";
import { formatCurrency, roundMoney } from "@/lib/format";

const inputClass =
  "w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30";

function optionClass(isSelected: boolean, isDisabled = false) {
  if (isDisabled) {
    return "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400";
  }
  return isSelected
    ? "cursor-pointer border-vino bg-vino text-white"
    : "cursor-pointer border-madera/30 bg-white text-madera hover:bg-crema";
}

export default function OrderForm() {
  const { user } = useAuth();
  const { dishes, isLoading, createOrder } = useOrders();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("local");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [notes, setNotes] = useState("");
  // Cantidad elegida por id de platillo.
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<OrderFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Solo cuentan platillos disponibles: si uno se marca como agotado desde
  // /menu mientras se arma el pedido, el polling lo saca automáticamente.
  const selected = dishes
    .filter((dish) => dish.available && (quantities[dish.id] ?? 0) > 0)
    .map((dish) => ({ dish, quantity: quantities[dish.id] }));
  const droppedNames = dishes
    .filter((dish) => !dish.available && (quantities[dish.id] ?? 0) > 0)
    .map((dish) => dish.name);
  const total = roundMoney(
    selected.reduce((acc, { dish, quantity }) => acc + dish.price * quantity, 0)
  );

  // Disponibles primero, agotados al final (visibles pero bloqueados).
  const sortedDishes = [...dishes].sort((a, b) => Number(b.available) - Number(a.available));

  function changeQuantity(dishId: string, delta: number) {
    setSuccessMessage(null);
    setQuantities((prev) => {
      const next = Math.min(
        Math.max((prev[dishId] ?? 0) + delta, 0),
        ORDER_LIMITS.maxQuantityPerItem
      );
      return { ...prev, [dishId]: next };
    });
  }

  function changeDeliveryType(next: DeliveryType) {
    setDeliveryType(next);
    // Si ya estaba elegida la tarjeta y pasa a domicilio, se cambia a
    // efectivo (el POS solo está en el local).
    if (!isPaymentAllowed(next, paymentMethod)) setPaymentMethod("efectivo");
  }

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryType("local");
    setDeliveryAddress("");
    setPaymentMethod("efectivo");
    setNotes("");
    setQuantities({});
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!user) return;

    const input: CreateOrderInput = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      deliveryType,
      deliveryAddress:
        deliveryType === "domicilio" ? deliveryAddress.trim() || undefined : undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
      items: selected.map(({ dish, quantity }) => ({
        dishId: dish.id,
        dishName: dish.name,
        unitPrice: dish.price,
        quantity,
      })),
      createdBy: { id: user.id, nombre: user.nombre },
    };

    const validationErrors = validateCreateOrderInput(input);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    const result = await createOrder(input);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error ?? "No se pudo registrar el pedido.");
      return;
    }

    resetForm();
    setSuccessMessage(`Pedido de ${input.customerName} registrado.`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-8 rounded-lg border border-madera/20 bg-white p-5 shadow"
    >
      <h2 className="mb-3 text-lg font-bold text-vino">Nuevo pedido</h2>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-madera">
            Cliente
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={ORDER_LIMITS.customerNameMax}
            className={inputClass}
            placeholder="Doña Marta (mesa 3)"
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-700">{errors.customerName}</p>
          )}
        </div>
        <div>
          <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-madera">
            Teléfono{" "}
            {deliveryType !== "domicilio" && (
              <span className="font-normal text-madera/70">(opcional)</span>
            )}
          </label>
          <input
            id="customerPhone"
            type="tel"
            inputMode="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className={inputClass}
            placeholder="7012-3456"
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-700">{errors.customerPhone}</p>
          )}
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-madera">
            Notas <span className="font-normal text-madera/70">(opcional)</span>
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={ORDER_LIMITS.notesMax}
            className={inputClass}
            placeholder="Sin cebolla, cambio de $20..."
          />
          {errors.notes && <p className="mt-1 text-sm text-red-700">{errors.notes}</p>}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-madera">Tipo de entrega</legend>
          <div className="flex flex-wrap gap-2">
            {DELIVERY_TYPES.map((type) => (
              <label
                key={type}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-vino/30 ${optionClass(
                  deliveryType === type
                )}`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={deliveryType === type}
                  onChange={() => changeDeliveryType(type)}
                  className="sr-only"
                />
                {DELIVERY_TYPE_LABELS[type]}
              </label>
            ))}
          </div>
          {errors.deliveryType && (
            <p className="mt-1 text-sm text-red-700">{errors.deliveryType}</p>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-madera">Método de pago</legend>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isDisabled = !isPaymentAllowed(deliveryType, method);
              return (
                <label
                  key={method}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-vino/30 ${optionClass(
                    paymentMethod === method,
                    isDisabled
                  )}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    disabled={isDisabled}
                    aria-describedby={isDisabled ? "card-not-allowed" : undefined}
                    onChange={() => setPaymentMethod(method)}
                    className="sr-only"
                  />
                  {PAYMENT_METHOD_LABELS[method]}
                </label>
              );
            })}
          </div>
          {deliveryType === "domicilio" && (
            <p id="card-not-allowed" className="mt-1 text-xs text-madera">
              {CARD_NOT_ALLOWED_MESSAGE}
            </p>
          )}
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-700">{errors.paymentMethod}</p>
          )}
        </fieldset>
      </div>

      {deliveryType === "domicilio" && (
        <div className="mb-4">
          <label htmlFor="deliveryAddress" className="mb-1 block text-sm font-medium text-madera">
            Dirección de entrega
          </label>
          <input
            id="deliveryAddress"
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            maxLength={ORDER_LIMITS.addressMax}
            className={inputClass}
            placeholder="Col. Las Brisas, pasaje 3, casa #12"
          />
          {errors.deliveryAddress && (
            <p className="mt-1 text-sm text-red-700">{errors.deliveryAddress}</p>
          )}
        </div>
      )}

      <p className="mb-2 text-sm font-medium text-madera">Platillos</p>
      {isLoading ? (
        <ul className="grid animate-pulse grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Cargando platillos">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="h-[3.25rem] rounded-md border border-madera/10 bg-hueso" />
          ))}
        </ul>
      ) : dishes.length === 0 ? (
        <p className="rounded-md bg-crema px-3 py-2 text-sm text-madera">
          No hay platillos en el menú todavía. Agrégalos desde la sección Menú.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sortedDishes.map((dish) => {
            const quantity = dish.available ? (quantities[dish.id] ?? 0) : 0;
            return (
              <li
                key={dish.id}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                  dish.available
                    ? quantity > 0
                      ? "border-cobre/50 bg-cobre/5"
                      : "border-madera/20 bg-white"
                    : "border-stone-200 bg-stone-50"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-medium ${
                      dish.available ? "text-stone-900" : "text-stone-400 line-through"
                    }`}
                  >
                    {dish.name}
                  </p>
                  <p className="text-xs text-madera">
                    {formatCurrency(dish.price)}
                    {!dish.available && (
                      <span className="ml-2 font-semibold text-red-600">Agotado</span>
                    )}
                  </p>
                </div>

                {dish.available && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQuantity(dish.id, -1)}
                      disabled={quantity === 0}
                      aria-label={`Quitar un ${dish.name}`}
                      className="h-7 w-7 rounded border border-madera/30 text-madera transition-colors hover:bg-crema disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(dish.id, 1)}
                      disabled={quantity >= ORDER_LIMITS.maxQuantityPerItem}
                      aria-label={`Agregar un ${dish.name}`}
                      className="h-7 w-7 rounded border border-madera/30 text-madera transition-colors hover:bg-crema disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {errors.items && <p className="mt-2 text-sm text-red-700">{errors.items}</p>}
      {droppedNames.length > 0 && (
        <p className="mt-2 rounded-md bg-cobre/10 px-3 py-2 text-sm text-madera">
          Se agotó y no se incluirá en el pedido: {droppedNames.join(", ")}.
        </p>
      )}

      {errors.general && <p className="mt-3 text-sm text-red-700">{errors.general}</p>}
      {formError && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}
      {successMessage && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMessage}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-madera/10 pt-4">
        <p className="text-sm text-madera">
          Total: <span className="text-xl font-bold text-vino">{formatCurrency(total)}</span>
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-vino px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vino/90 disabled:opacity-60"
        >
          {isSubmitting ? "Registrando..." : "Registrar pedido"}
        </button>
      </div>
    </form>
  );
}
