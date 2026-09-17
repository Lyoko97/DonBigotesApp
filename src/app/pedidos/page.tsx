import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

// TODO(Persona 3): construir aquí el CRUD real de pedidos/comandas.
export default function PedidosPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-vino">Pedidos</h1>
        <p className="mt-2 max-w-md text-madera">
          Esta sección está en construcción. Aquí se gestionarán los pedidos
          y comandas del comedor.
        </p>
      </main>
    </ProtectedRoute>
  );
}
