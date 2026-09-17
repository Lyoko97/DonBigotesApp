import type { User } from "@/types/auth";

// TODO: este arreglo en memoria simula la tabla "usuarios" del backend real.
// Reemplazar por llamadas a la API REST (ej. POST /api/auth/login,
// POST /api/auth/register) cuando el backend Node/Express/PostgreSQL de la
// Etapa 3 esté disponible.
export const mockUsers: User[] = [
  {
    id: "1",
    nombre: "Doña Rosa",
    email: "rosa@donbigotes.com",
    password: "comedor123",
    role: "admin",
  },
  {
    id: "2",
    nombre: "Encargado de turno",
    email: "encargado@donbigotes.com",
    password: "turno123",
    role: "encargado",
  },
];
