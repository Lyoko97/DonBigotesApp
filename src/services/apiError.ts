import axios from "axios";
import type { OrderFieldErrors } from "@/types/order";

// Traduce cualquier error de axios a un mensaje apto para mostrar al usuario.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "No se pudo conectar con el servidor. Revisa tu conexión.";
    const message = (error.response.data as { error?: unknown } | undefined)?.error;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export function getApiFieldErrors(error: unknown): OrderFieldErrors | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const fieldErrors = (error.response?.data as { fieldErrors?: unknown } | undefined)?.fieldErrors;
  return typeof fieldErrors === "object" && fieldErrors !== null
    ? (fieldErrors as OrderFieldErrors)
    : undefined;
}
