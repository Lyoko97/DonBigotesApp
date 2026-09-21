"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error ?? "No se pudo iniciar sesión.");
      return;
    }

    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password}</p>}
      </div>

      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-vino px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vino/90 disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
