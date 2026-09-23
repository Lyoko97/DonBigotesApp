interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, hint, highlight = false }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        highlight ? "border-cobre/40 bg-cobre/10" : "border-madera/20 bg-white"
      }`}
    >
      <p className="text-sm text-madera">{label}</p>
      <p className="mt-2 text-3xl font-bold text-vino">{value}</p>
      {hint && <p className="mt-1 text-xs text-madera/80">{hint}</p>}
    </div>
  );
}
