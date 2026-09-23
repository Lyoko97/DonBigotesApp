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
