import { Suspense } from "react";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hueso px-4">
      <div className="w-full max-w-sm rounded-xl border border-madera/20 bg-crema p-8 shadow-lg">
        <h1 className="mb-1 text-center text-2xl font-bold text-vino">Don Bigotes</h1>
        <p className="mb-6 text-center text-sm text-madera">
          Inicia sesión para continuar
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
