import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hueso px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-madera/20 bg-crema p-8 shadow-lg">
        <h1 className="mb-1 text-center text-2xl font-bold text-vino">Crear cuenta</h1>
        <p className="mb-6 text-center text-sm text-madera">
          Regístrate para gestionar el comedor
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
