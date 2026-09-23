# DonBigotesApp — Web (Etapa 2)

Panel web administrativo para el Comedor "Don Bigotes" (Colonia Las Brisas,
Soyapango). Proyecto de capstone — Etapa 2: aplicación Next.js con
autenticación y roles, gestión del menú, registro y seguimiento de pedidos,
y un dashboard con el resumen del día.

- Manual de usuario del módulo de pedidos y dashboard:
  [`docs/manual-usuario-pedidos.md`](docs/manual-usuario-pedidos.md)

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- Context API para autenticación, roles y estado de pedidos (sin Redux)
- axios para consumir las rutas de la API REST

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
- **Pedidos:** API REST propia (`/api/orders`) con un store en memoria
  (`src/lib/ordersStore.ts`) que simula la tabla "pedidos" de PostgreSQL e
  incluye pedidos de ejemplo del día. En Vercel **no persiste entre
  instancias**: un cold start vuelve a los datos de ejemplo y dos instancias
  activas pueden mostrar listas distintas. Registrar un pedido todavía no
  descuenta stock del platillo (TODO para la etapa con base de datos).

## Desarrollo local

Requisito: Node.js 20.9 o superior (probado con Node 24 LTS).

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

Separación por capas:

| Capa | Ubicación |
|---|---|
| Tipos | `src/types/` — `auth.ts`, `dish.ts`, `order.ts`, `dashboard.ts` |
| Datos / API | `src/app/api/` (`dishes`, `orders`) y `src/lib/` (stores en memoria, validación, cálculos del dashboard) |
| Lógica de cliente | `src/services/` (llamadas axios), `src/hooks/` (`usePolling`) y `src/context/` (`AuthContext`, `OrdersContext`) |
| UI | `src/components/` (`Navbar`, `ProtectedRoute`, `forms/`, `orders/`, `dashboard/`) y páginas en `src/app/(login\|register\|dashboard\|menu\|pedidos)` |

- `src/proxy.ts` — protege `/dashboard`, `/menu`, `/pedidos` y `/register`
  a nivel de ruta; `ProtectedRoute` aplica además los permisos por rol en el
  cliente.

`/menu` está completamente implementado: CRUD de platillos con integración
a la API REST.

### Pedidos y dashboard

**`/pedidos`**

- Registro de pedidos con cliente, teléfono y notas opcionales, y selección
  de platillos con cantidades y total en vivo. Solo se ofrecen platillos
  disponibles; los agotados se ven bloqueados.
- Flujo de estados: `pendiente → en_preparacion → listo → entregado`, y
  `cancelado` desde cualquier estado en curso. Las transiciones inválidas se
  rechazan en el servidor (`409`).
- Filtro por estado con conteos y opción "Solo pedidos de hoy".
- Cancelar conserva el pedido en el historial; eliminar es definitivo y solo
  lo ve el `admin`.

**`/dashboard`**

| Indicador | Encargado | Admin |
|---|:---:|:---:|
| Pedidos de hoy (en curso / cancelados) | ✔ | ✔ |
| Platillos disponibles | ✔ | ✔ |
| Ventas del día (pedidos entregados) | ✔ | ✔ |
| Últimos 5 pedidos | ✔ | ✔ |
| Ingresos cobrados, por cobrar y ticket promedio | — | ✔ |
| Top 5 de platillos más vendidos | — | ✔ |

**Actualización dinámica:** `OrdersContext` consulta `/api/orders` y
`/api/dishes` al entrar, cada 10 s mientras la pestaña está visible, al
volver a la pestaña y después de cada acción. Si dos respuestas se solapan
solo se aplica la más reciente.

**Validación:** las mismas reglas (`src/lib/orderValidation.ts`) se usan en
el formulario y en la API: nombre de 2 a 60 caracteres, teléfono salvadoreño
de 8 dígitos opcional, notas de hasta 200 caracteres, de 1 a 20 platillos
distintos y de 1 a 50 unidades por platillo.

**"Hoy"** se calcula con la zona horaria `America/El_Salvador`, porque los
servidores de Vercel corren en UTC.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/orders?status=&date=today` | Lista pedidos (más recientes primero) |
| POST | `/api/orders` | Crea un pedido en estado `pendiente` |
| PATCH | `/api/orders/:id` | Cambia el estado (`{ "status": "listo" }`) |
| DELETE | `/api/orders/:id` | Elimina el pedido |

Las rutas responden `401` sin cookie de sesión. El permiso de borrado del
admin se aplica en la UI: la cookie mock solo guarda el id del usuario, no su
rol (TODO: validar un JWT con rol cuando exista el backend real).

## Despliegue

La aplicación está desplegada en Vercel:
[https://don-bigotes-app.vercel.app](https://don-bigotes-app.vercel.app)

## Verificación

```bash
npm run lint
npm run build
```

Prueba manual del módulo de pedidos:

1. Iniciar sesión como `encargado`, registrar un pedido en `/pedidos`,
   avanzarlo de estado y cancelar otro. No debe aparecer "Eliminar".
2. Marcar un platillo como agotado en `/menu`: en `/pedidos` debe verse
   bloqueado en unos 10 s.
3. Iniciar sesión como `admin`: en `/dashboard` deben verse ingresos y
   platillos más vendidos, y en `/pedidos` el botón "Eliminar".
4. Sin sesión, `/pedidos` redirige a `/login` y `/api/orders` responde `401`.

## Limitaciones conocidas (Etapa 2)

- Menú y pedidos se guardan en memoria del servidor: en Vercel no persisten
  entre instancias ni tras un cold start, y las dos APIs no comparten
  memoria (por eso cada pedido guarda su propia copia de nombre y precio).
- La cookie de sesión mock solo contiene el id del usuario: los permisos por
  rol se aplican en la UI, no en la API.
- Registrar un pedido no descuenta stock.
- Los usuarios creados desde `/register` viven en la memoria del navegador y
  se pierden al recargar la página.
