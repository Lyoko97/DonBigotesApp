import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

// TODO(Persona 2): construir aquí el CRUD real del menú del día.
export default function MenuPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-vino">Menú</h1>
        <p className="mt-2 max-w-md text-madera">
          Esta sección está en construcción. Aquí se gestionará el menú del
          día del comedor.
        </p>
      </main>
    </ProtectedRoute>
  );
}
