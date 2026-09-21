# DonBigotesApp — Web (Etapa 2)

Panel web administrativo para el Comedor "Don Bigotes" (Colonia Las Brisas,
Soyapango). Proyecto de capstone — Etapa 2: base de Next.js con
autenticación, roles y estructura para los módulos de menú y pedidos.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- Context API para autenticación y roles (sin Redux)

Persistencia de datos por módulo:

- **Autenticación y usuarios:** datos mock en memoria + `localStorage`, sin
  backend real todavía (Etapa 3). Los puntos donde se conectará están marcados
  con `// TODO` en `src/lib/auth.ts`, `src/lib/mockUsers.ts`,
  `src/context/AuthContext.tsx` y `src/proxy.ts`.
- **Menú:** API REST propia (rutas `/api/dishes` en Next.js). Los datos persisten correctamente durante las pruebas en
  producción (Vercel), pero al ser almacenamiento en memoria del lado del
  servidor (sin base de datos) podrían no ser 100% consistentes bajo alta
  concurrencia o tras un cold start prolongado. Se reemplazará por una base de
  datos real en una etapa posterior.
- **Pedidos:** pendiente.

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

El registro ya no es público: crear cuentas nuevas desde `/register` es una
acción exclusiva del rol `admin`, pensada para dar de alta a nuevos miembros
del equipo (encargados u otros admins).

## Estructura

- `src/app/(login|register|dashboard|menu|pedidos)` — páginas
- `src/context/AuthContext.tsx` — Context API: `login`, `register`,
  `logout`, usuario y rol actuales
- `src/components/` — `Navbar`, `ProtectedRoute`, formularios
- `src/lib/` — lógica de datos mock y validación de formularios
- `src/proxy.ts` — protege `/dashboard`, `/menu` y `/pedidos` a nivel de ruta

`/menu` está completamente implementado: CRUD de platillos con integración
a la API REST. `/pedidos` es un placeholder protegido ("en construcción"),
pendiente del tercer integrante del equipo.

## Despliegue

La aplicación está desplegada en Vercel:
[https://don-bigotes-app.vercel.app](https://don-bigotes-app.vercel.app)

## Verificación

```bash
npm run lint
npm run build
```
