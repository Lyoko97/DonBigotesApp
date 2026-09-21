"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword, validateRequired } from "@/lib/validation";
import type { Role } from "@/types/auth";

type FormErrors = Partial<
  Record<"nombre" | "email" | "password" | "confirmPassword", string>
>;

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("encargado");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: FormErrors = {
      nombre: validateRequired(nombre, "El nombre") ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        confirmPassword !== password ? "Las contraseñas no coinciden." : undefined,
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    if (hasErrors) return;

    setIsSubmitting(true);
    const result = await register(nombre.trim(), email.trim(), password, role);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error ?? "No se pudo crear la cuenta.");
      return;
    }

    // El admin creó la cuenta de otro usuario; su propia sesión no cambia,
    // así que simplemente vuelve al dashboard.
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-madera">
          Nombre completo
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30"
          placeholder="Doña Rosa"
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-700">{errors.nombre}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-madera">
          Correo
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30"
          placeholder="rosa@donbigotes.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-madera">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30"
          placeholder="Mínimo 6 caracteres"
        />
        {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password}</p>}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium text-madera"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-700">{errors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-madera">
          Rol
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-md border border-madera/30 bg-white px-3 py-2 text-sm text-stone-900 focus:border-vino focus:outline-none focus:ring-2 focus:ring-vino/30"
        >
          <option value="encargado">Encargado (empleado)</option>
          <option value="admin">Admin (dueño del comedor)</option>
        </select>
      </div>

      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-vino px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vino/90 disabled:opacity-60"
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
