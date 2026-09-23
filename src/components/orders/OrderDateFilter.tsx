import type { DateFilterValue, DatePreset } from "@/lib/orderFilters";

const PRESETS: { value: Exclude<DatePreset, "fecha">; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "ayer", label: "Ayer" },
  { value: "7dias", label: "Últimos 7 días" },
  { value: "todas", label: "Todas" },
];

interface OrderDateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  todayKey: string | null;
}

export default function OrderDateFilter({ value, onChange, todayKey }: OrderDateFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtrar por fecha">
      {PRESETS.map((preset) => {
        const isActive = value.preset === preset.value;
        return (
          <button
            key={preset.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange({ ...value, preset: preset.value })}
            className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-cobre bg-cobre text-white"
                : "border-madera/30 bg-white text-madera hover:bg-crema"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
      <label className="flex items-center gap-2 text-sm text-madera">
        <span className="sr-only">Fecha específica</span>
        <input
          type="date"
          value={value.preset === "fecha" ? value.customDate : ""}
          max={todayKey ?? undefined}
          onChange={(e) =>
            onChange(
              e.target.value
                ? { preset: "fecha", customDate: e.target.value }
                : { preset: "hoy", customDate: "" }
            )
          }
          className={`rounded-md border px-2 py-1 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30 ${
            value.preset === "fecha" ? "border-cobre bg-cobre/10" : "border-madera/30 bg-white"
          }`}
        />
      </label>
    </div>
  );
}
