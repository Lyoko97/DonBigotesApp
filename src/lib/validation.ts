export function validateEmail(email: string): string | null {
  if (!email.trim()) return "El correo es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Ingresa un correo válido.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} es obligatorio.`;
  return null;
}
