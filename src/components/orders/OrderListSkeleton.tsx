// Tarjetas "fantasma" con la misma forma que OrderCard mientras carga la
// primera sincronización.
export default function OrderListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-busy="true" aria-label="Cargando pedidos">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-madera/20 bg-white p-5 shadow"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 rounded bg-hueso" />
              <div className="h-5 w-40 rounded bg-hueso" />
            </div>
            <div className="h-5 w-20 rounded-full bg-hueso" />
          </div>
          <div className="space-y-2 border-y border-madera/10 py-3">
            <div className="h-4 w-full rounded bg-hueso" />
            <div className="h-4 w-3/4 rounded bg-hueso" />
          </div>
          <div className="mt-4 flex justify-between">
            <div className="h-8 w-36 rounded bg-hueso" />
            <div className="h-6 w-16 rounded bg-hueso" />
          </div>
        </div>
      ))}
    </div>
  );
}
