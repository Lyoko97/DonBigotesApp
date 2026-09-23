"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import type { CreateOrderInput, OrderFieldErrors } from "@/types/order";
import { hasErrors, ORDER_LIMITS, validateCreateOrderInput } from "@/lib/orderValidation";
import { formatCurrency, roundMoney } from "@/lib/format";

const inputClass =
  "w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30";

export default function OrderForm() {
  const { user } = useAuth();
  const { dishes, createOrder } = useOrders();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
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
            Teléfono <span className="font-normal text-madera/70">(opcional)</span>
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
            placeholder="Para llevar, sin cebolla..."
          />
          {errors.notes && <p className="mt-1 text-sm text-red-700">{errors.notes}</p>}
        </div>
      </div>

      <p className="mb-2 text-sm font-medium text-madera">Platillos</p>
      {dishes.length === 0 ? (
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
