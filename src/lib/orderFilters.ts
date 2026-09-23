import { addDaysToKey } from "@/lib/format";

export type DatePreset = "hoy" | "ayer" | "7dias" | "todas" | "fecha";

export interface DateFilterValue {
  preset: DatePreset;
  customDate: string; // "YYYY-MM-DD", solo se usa con preset "fecha"
}

export function matchesDateFilter(
  orderDateKey: string,
  filter: DateFilterValue,
  todayKey: string
): boolean {
  switch (filter.preset) {
    case "hoy":
      return orderDateKey === todayKey;
    case "ayer":
      return orderDateKey === addDaysToKey(todayKey, -1);
    case "7dias":
      return orderDateKey >= addDaysToKey(todayKey, -6) && orderDateKey <= todayKey;
    case "fecha":
      return !filter.customDate || orderDateKey === filter.customDate;
    case "todas":
      return true;
  }
}
