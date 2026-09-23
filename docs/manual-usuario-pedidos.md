# Manual de usuario — Pedidos y Dashboard

**DonBigotesApp · Comedor "Don Bigotes"** (Colonia Las Brisas, Soyapango)
Módulo: registro y seguimiento de pedidos, y resumen del día.
Versión: Etapa 2 (web).

---

## 1. ¿Para qué sirve este módulo?

Antes, los pedidos llegaban por WhatsApp y se anotaban en papel, lo que
causaba confusiones y pedidos olvidados. Con este módulo el equipo del
comedor puede:

- Registrar cada pedido con el nombre del cliente, sus platillos y el total.
- Ver en qué paso va cada pedido: pendiente, en preparación, listo o entregado.
- Evitar vender platillos que ya se agotaron.
- Consultar al instante cuántos pedidos y ventas lleva el día y, para la
  dueña, cuánto se ha cobrado y qué es lo que más se vende.

## 2. Acceso

1. Abre la aplicación en el navegador (computadora, tablet o celular).
2. Inicia sesión con tu correo y contraseña.
3. En la barra superior usa **Pedidos** para trabajar con las comandas y
   **Dashboard** para ver el resumen del día.

> Si intentas entrar a una página sin haber iniciado sesión, la aplicación te
> lleva automáticamente a la pantalla de inicio de sesión.

`[Captura: barra de navegación con Dashboard, Menú y Pedidos]`

## 3. Qué puede hacer cada rol

| Acción | Encargado de turno | Admin (dueña) |
|---|:---:|:---:|
| Registrar pedidos | ✔ | ✔ |
| Ver y filtrar pedidos | ✔ | ✔ |
| Avanzar el estado de un pedido | ✔ | ✔ |
| Cancelar un pedido | ✔ | ✔ |
| Eliminar un pedido definitivamente | — | ✔ |
| Ver pedidos del día, platillos disponibles y ventas | ✔ | ✔ |
| Ver ingresos, ticket promedio y platillos más vendidos | — | ✔ |

**Cancelar o eliminar:** al cancelar, el pedido se queda en la lista marcado
como *Cancelado* y no cuenta en las ventas; así queda constancia de lo que
pasó. Eliminar lo borra por completo, por eso solo lo puede hacer la dueña.

## 4. La pantalla de Pedidos

`[Captura: pantalla completa de /pedidos]`

La pantalla tiene cuatro partes, de arriba hacia abajo:

1. **Encabezado:** título y, a la derecha, la hora de la última
   actualización (*Actualizado 7:45 p. m.*) con el botón **Actualizar**.
2. **Formulario "Nuevo pedido"**.
3. **Filtros:** botones por estado y la casilla **Solo pedidos de hoy**.
4. **Lista de pedidos:** una tarjeta por pedido, los más recientes primero.

## 5. Registrar un pedido

1. En **Cliente**, escribe el nombre de quien pide. Puedes agregar la mesa,
   por ejemplo *Don Chepe (mesa 2)*.
2. En **Teléfono** (opcional), escribe el número del cliente, con o sin
   guion: *7012-3456* o *70123456*. Déjalo vacío si el pedido es en mesa.
3. En **Notas** (opcional), agrega indicaciones: *Para llevar*,
   *Sin cebolla*, etc. (máximo 200 caracteres).
4. En **Platillos**, usa **+** y **−** para elegir la cantidad de cada
   platillo. El platillo elegido se resalta y el **Total** se calcula solo.
5. Presiona **Registrar pedido**.

Si todo está bien aparece el mensaje *"Pedido de [cliente] registrado."*, el
formulario se limpia y el pedido aparece en la lista como **Pendiente**.

`[Captura: formulario con platillos seleccionados y total]`

### Platillos agotados

- Los platillos marcados como agotados en la sección **Menú** aparecen
  tachados, con la etiqueta **Agotado** y sin botones: no se pueden pedir.
- Si un platillo se agota *mientras* estás armando el pedido, se quita del
  total y aparece el aviso *"Se agotó y no se incluirá en el pedido: …"*.
  Revisa con el cliente antes de registrar.
- Si no aparece ningún platillo, primero hay que agregarlos en **Menú**.

## 6. Estados de un pedido

| Estado | Significado | Siguiente paso |
|---|---|---|
| **Pendiente** | Recién registrado, la cocina aún no empieza. | Pasar a preparación |
| **En preparación** | La cocina lo está preparando. | Marcar como listo |
| **Listo para entregar** | Esperando que el cliente lo recoja o se entregue. | Marcar entregado |
| **Entregado** | Entregado y cobrado. Cuenta como venta. | — (final) |
| **Cancelado** | No se preparó o el cliente se retractó. No cuenta como venta. | — (final) |

Los pasos van siempre en ese orden: no se puede saltar de *Pendiente* a
*Entregado*, ni reactivar un pedido *Entregado* o *Cancelado*.

## 7. Trabajar con un pedido

Cada tarjeta muestra el número de comanda y la hora (ej. *#0007 · 7:47 p. m.*),
el cliente y su teléfono, los platillos con cantidades y subtotales, las notas,
quién lo registró, el total y el estado actual.

`[Captura: tarjeta de pedido con sus botones]`

### Avanzar el estado

Presiona el botón principal de la tarjeta (**Pasar a preparación**,
**Marcar como listo** o **Marcar entregado**). El cambio se guarda al
instante y los demás usuarios lo verán en su próxima actualización.

### Cancelar

1. Presiona **Cancelar**.
2. Aparece la pregunta *"¿Cancelar este pedido?"*.
3. Presiona **Sí, confirmar** (o **No** para dejarlo como estaba).

Solo se pueden cancelar pedidos que aún no se entregan.

### Eliminar (solo admin)

1. Presiona **Eliminar** (esquina inferior derecha de la tarjeta).
2. Confirma en *"¿Eliminar el pedido definitivamente?"* con **Sí, confirmar**.

Esta acción no se puede deshacer. Úsala solo para pedidos registrados por
error (por ejemplo, duplicados); para lo demás, usa **Cancelar**.

## 8. Filtrar pedidos

- Los botones **Todos**, **Pendiente**, **En preparación**,
  **Listo para entregar**, **Entregado** y **Cancelado** muestran solo los
  pedidos de ese estado. El número entre paréntesis indica cuántos hay.
- La casilla **Solo pedidos de hoy** (activada de inicio) oculta pedidos de
  días anteriores. El "día" se cuenta con la hora de El Salvador.

Consejo para la cocina: deja el filtro en **Pendiente** o
**En preparación** para ver solo lo que falta preparar.

## 9. Actualización automática

No necesitas recargar la página: la lista de pedidos, el menú y el dashboard
se actualizan solos cada 10 segundos mientras la pestaña esté abierta y
visible, y también en cuanto regresas a ella. Si quieres ver los cambios de
inmediato, presiona **Actualizar**.

## 10. El Dashboard

`[Captura: dashboard visto por el admin]`

**Para todos los usuarios:**

| Tarjeta | Qué muestra |
|---|---|
| **Pedidos de hoy** | Pedidos del día sin contar cancelados. Debajo: cuántos están en curso y cuántos se cancelaron. |
| **Platillos disponibles** | Platillos del menú que se pueden vender ahora, de cuántos hay en total. |
| **Ventas del día** | Pedidos entregados hoy. |
| **Últimos pedidos** | Los 5 pedidos más recientes del día con su estado. **Ver todos →** lleva a Pedidos. |

**Solo para el admin** (sección *Solo admin · Ingresos del día*):

| Tarjeta | Qué muestra |
|---|---|
| **Ingresos cobrados** | Suma de los pedidos entregados hoy. |
| **Por cobrar** | Suma de los pedidos que todavía están en curso. |
| **Ticket promedio** | Lo que gasta en promedio cada pedido entregado. |
| **Platillos más vendidos hoy** | Los 5 platillos con más unidades pedidas (sin contar cancelados), con lo que han generado. |

## 11. Mensajes frecuentes y qué hacer

| Mensaje | Qué significa / qué hacer |
|---|---|
| *El nombre del cliente es obligatorio.* | Escribe el nombre del cliente (mínimo 2 letras). |
| *Ingresa un teléfono válido de 8 dígitos (ej. 7012-3456).* | El número debe tener 8 dígitos y empezar con 2, 6 o 7. Si no lo tienes, deja el campo vacío. |
| *Agrega al menos un platillo al pedido.* | Usa **+** en algún platillo disponible. |
| *Se agotó y no se incluirá en el pedido: …* | Ese platillo se agotó mientras armabas el pedido. Consulta con el cliente. |
| *No se puede pasar un pedido de "…" a "…".* | Otra persona ya cambió el estado de ese pedido. La tarjeta se actualiza sola con el estado real. |
| *El pedido no existe o ya fue eliminado.* | Otro usuario lo eliminó. La lista se actualiza sola. |
| *No se pudo conectar con el servidor. Revisa tu conexión.* | Revisa el internet y presiona **Actualizar**. Los últimos datos se siguen mostrando. |
| *Tu sesión expiró. Vuelve a iniciar sesión.* | Presiona **Salir** e inicia sesión de nuevo. |

## 12. Limitaciones de esta versión

Esta es la versión web de la Etapa 2, todavía sin base de datos definitiva:

- Los pedidos se guardan temporalmente en el servidor. En la versión
  publicada pueden **reiniciarse a los pedidos de ejemplo** después de un
  rato sin uso, o verse distintos entre dos dispositivos por unos segundos.
  No debe usarse todavía como único registro de ventas.
- Registrar un pedido **no descuenta el stock** del platillo: para marcar un
  platillo como agotado hay que hacerlo manualmente en **Menú**.
- Las próximas etapas agregarán base de datos real, pedidos desde el bot de
  WhatsApp y la app móvil.
