interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  isLoading?: boolean;
}

export default function StatCard({
  label,
  value,
  hint,
  highlight = false,
  isLoading = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        highlight ? "border-cobre/40 bg-cobre/10" : "border-madera/20 bg-white"
      }`}
      aria-busy={isLoading}
    >
      <p className="text-sm text-madera">{label}</p>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="mt-3 h-8 w-20 rounded bg-hueso" />
          <div className="mt-2 h-3 w-28 rounded bg-hueso" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-3xl font-bold text-vino">{value}</p>
          {hint && <p className="mt-1 text-xs text-madera/80">{hint}</p>}
        </>
      )}
    </div>
  );
}
