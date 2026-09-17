# DonBigotesApp — Web (Etapa 2)

Panel web administrativo para el Comedor "Don Bigotes" (Colonia Las Brisas,
Soyapango). Proyecto de capstone — Etapa 2: base de Next.js con
autenticación, roles y estructura para los módulos de menú y pedidos.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- Context API para autenticación y roles (sin Redux)
- Datos mock en memoria + `localStorage` el backend real (Etapa 3) aún no
  existe; los puntos donde se conectará están marcados con `// TODO` en
  `src/lib/auth.ts`, `src/lib/mockUsers.ts`, `src/context/AuthContext.tsx` y
  `src/proxy.ts`

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Usuarios de prueba (ver `src/lib/mockUsers.ts`):

| Rol | Correo | Contraseña |
|---|---|---|
| admin | rosa@donbigotes.com | comedor123 |
| encargado | encargado@donbigotes.com | turno123 |

También se puede registrar una cuenta nueva desde `/register`.

## Estructura

- `src/app/(login|register|dashboard|menu|pedidos)` — páginas
- `src/context/AuthContext.tsx` — Context API: `login`, `register`,
  `logout`, usuario y rol actuales
- `src/components/` — `Navbar`, `ProtectedRoute`, formularios
- `src/lib/` — lógica de datos mock y validación de formularios
- `src/proxy.ts` — protege `/dashboard`, `/menu` y `/pedidos` a nivel de ruta

`/menu` y `/pedidos` son placeholders protegidos ("en construcción") listos
para ser construidos encima.

## Verificación

```bash
npm run lint
npm run build
```
