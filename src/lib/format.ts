// El comedor opera en El Salvador (UTC-6, sin horario de verano), pero los
// servidores de Vercel corren en UTC. Todo lo que dependa de "hoy" se calcula
// con esta zona horaria para que los pedidos de la tarde-noche no se cuenten
// como del día siguiente.
export const BUSINESS_TIME_ZONE = "America/El_Salvador";
const BUSINESS_UTC_OFFSET = "-06:00";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("es-SV", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

// "YYYY-MM-DD" del día del negocio al que pertenece una fecha.
export function toBusinessDateKey(value: Date | string): string {
  return dateKeyFormatter.format(new Date(value));
}

export function getTodayKey(): string {
  return toBusinessDateKey(new Date());
}

// Medianoche (hora de El Salvador) del día indicado.
export function startOfBusinessDay(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00${BUSINESS_UTC_OFFSET}`);
}

// Aritmética sobre claves "YYYY-MM-DD" sin depender de la zona horaria del
// equipo: se interpretan como fechas UTC puras.
function keyToUtcDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00Z`);
}

export function addDaysToKey(dateKey: string, days: number): string {
  const date = keyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Lunes de la semana a la que pertenece la fecha (la semana del comedor
// va de lunes a domingo).
export function startOfWeekKey(dateKey: string): string {
  const weekday = keyToUtcDate(dateKey).getUTCDay(); // 0 = domingo
  return addDaysToKey(dateKey, -((weekday + 6) % 7));
}

export function startOfMonthKey(dateKey: string): string {
  return `${dateKey.slice(0, 8)}01`;
}

const dayLabelFormatter = new Intl.DateTimeFormat("es-SV", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("es-SV", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// "lun 21"
export function formatDayLabel(dateKey: string): string {
  return dayLabelFormatter.format(keyToUtcDate(dateKey)).replace(".", "").replace(",", "");
}

// "lunes, 21 de septiembre"
export function formatLongDate(dateKey: string): string {
  return longDateFormatter.format(keyToUtcDate(dateKey));
}

// "hace 5 s", "hace 3 min", "hace 2 h"
export function formatRelativeTime(from: Date | string, nowMs: number): string {
  const seconds = Math.max(0, Math.floor((nowMs - new Date(from).getTime()) / 1000));
  if (seconds < 60) return `hace ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  return `hace ${Math.floor(minutes / 60)} h`;
}

export function formatTime(value: Date | string): string {
  return timeFormatter.format(new Date(value));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatOrderNumber(orderNumber: number): string {
  return `#${String(orderNumber).padStart(4, "0")}`;
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
