# Manual de usuario — Pedidos y Dashboard

**DonBigotesApp · Comedor "Don Bigotes"** (Colonia Las Brisas, Soyapango)
Módulo: registro y seguimiento de pedidos, y resumen del día.
Versión: Etapa 2 (web).

---

## 1. ¿Para qué sirve este módulo?

Antes, los pedidos llegaban por WhatsApp y se anotaban en papel, lo que
causaba confusiones y pedidos olvidados. Con este módulo el equipo del
comedor puede:

- Registrar cada pedido con el nombre del cliente, sus platillos, el tipo de
  entrega (local, para llevar o a domicilio), el método de pago y el total.
- Ver en qué paso va cada pedido: pendiente, en preparación, listo o entregado.
- Evitar vender platillos que ya se agotaron.
- Consultar al instante cuántos pedidos y ventas lleva el día y, para la
  dueña, cuánto se ha cobrado en el día, la semana y el mes, y qué es lo que
  más se vende.

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
| Ver pedidos del día, pedidos activos, platillos disponibles y ventas | ✔ | ✔ |
| Ver ingresos (día, semana y mes), ticket promedio y gráfico de 7 días | — | ✔ |
| Ver platillos más vendidos y pedidos por estado | — | ✔ |

**Cancelar o eliminar:** al cancelar, el pedido se queda en la lista marcado
como *Cancelado* y no cuenta en las ventas; así queda constancia de lo que
pasó. Eliminar lo borra por completo, por eso solo lo puede hacer la dueña.

## 4. La pantalla de Pedidos

`[Captura: pantalla completa de /pedidos]`

La pantalla tiene cuatro partes, de arriba hacia abajo:

1. **Encabezado:** título y, a la derecha, cuánto hace de la última
   actualización (*Actualizado hace 4 s*) con el botón **Actualizar**. El
   punto verde se vuelve naranja y parpadea mientras se actualiza.
2. **Formulario "Nuevo pedido"**.
3. **Filtros:** por fecha (arriba) y por estado (abajo).
4. **Lista de pedidos:** una tarjeta por pedido, los más recientes primero.

Mientras la página carga por primera vez verás tarjetas grises "fantasma" en
lugar de la lista; es normal y dura un instante.

## 5. Registrar un pedido

1. En **Cliente**, escribe el nombre de quien pide. Puedes agregar la mesa,
   por ejemplo *Don Chepe (mesa 2)*.
2. En **Teléfono**, escribe el número del cliente, con o sin guion:
   *7012-3456* o *70123456*. Es opcional en el local y para llevar, pero
   **obligatorio a domicilio**.
3. En **Notas** (opcional), agrega indicaciones: *Sin cebolla*,
   *Cambio de $20*, etc. (máximo 200 caracteres).
4. En **Tipo de entrega**, elige **Comer en el local**, **Para llevar** o
   **A domicilio**.
5. Si es **A domicilio**, aparece el campo **Dirección de entrega**: escribe
   colonia, pasaje o calle y número de casa.
6. En **Método de pago**, elige **Efectivo** o **Tarjeta** (ver abajo).
7. En **Platillos**, usa **+** y **−** para elegir la cantidad de cada
   platillo. El platillo elegido se resalta y el **Total** se calcula solo.
8. Presiona **Registrar pedido**.

Si todo está bien aparece el mensaje *"Pedido de [cliente] registrado."*, el
formulario se limpia y el pedido aparece en la lista como **Pendiente**.

`[Captura: formulario con platillos seleccionados y total]`

### Pago con tarjeta a domicilio

El POS para cobrar con tarjeta **solo está en el local**. Por eso, cuando el
tipo de entrega es **A domicilio**:

- La opción **Tarjeta** aparece gris y no se puede seleccionar.
- Debajo aparece el aviso *"El pago con tarjeta no está disponible a
  domicilio: el POS solo está en el local."*
- Si ya habías elegido **Tarjeta** y luego cambias a **A domicilio**, el pago
  se cambia solo a **Efectivo**. Avísale al cliente.

`[Captura: método de pago con Tarjeta bloqueada a domicilio]`

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

Cada tarjeta muestra:

- El número de comanda y la hora (ej. *#0007 · 7:47 p. m.*). Si el pedido es
  de otro día, también la fecha (ej. *#0150 · lun 21 · 1:15 p. m.*).
- El cliente y su teléfono.
- El tipo de entrega y el método de pago (ej. *A domicilio* · *Pago: Efectivo*)
  y, a domicilio, la dirección (*Entregar en: …*).
- Los platillos con cantidades y subtotales, las notas, quién lo registró,
  el total y el estado actual.

`[Captura: tarjeta de pedido con sus botones]`

### Avanzar el estado

Presiona el botón principal de la tarjeta (**Pasar a preparación**,
**Marcar como listo** o **Marcar entregado**). La tarjeta cambia de estado
**al instante**, sin esperar. Si el cambio no se pudo guardar (por ejemplo,
sin internet u otro usuario ya lo había movido), la tarjeta **vuelve sola a
su estado anterior** y aparece un mensaje en rojo explicando por qué. Los
demás usuarios verán el cambio en su próxima actualización.

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

**Por fecha** (fila de arriba):

- **Hoy** (elegido de inicio), **Ayer**, **Últimos 7 días** o **Todas**.
- Para un día concreto, elige la fecha en el calendario de la derecha. Para
  volver a hoy, presiona **Hoy**.
- El "día" se cuenta con la hora de El Salvador.

**Por estado** (fila de abajo):

- Los botones **Todos**, **Pendiente**, **En preparación**,
  **Listo para entregar**, **Entregado** y **Cancelado** muestran solo los
  pedidos de ese estado. El número entre paréntesis indica cuántos hay
  **en las fechas elegidas**.

Si ningún pedido coincide con los filtros aparece un recuadro con el mensaje
*"No hay pedidos en este rango de fechas."* y una sugerencia; prueba con otra
fecha u otro estado.

Consejo para la cocina: deja **Hoy** + **Pendiente** o **En preparación**
para ver solo lo que falta preparar.

## 9. Actualización automática

No necesitas recargar la página: la lista de pedidos, el menú y el dashboard
se actualizan solos cada 10 segundos mientras la pestaña esté abierta y
visible (si cambias de pestaña se pausa, y al regresar se actualiza de
inmediato). Arriba a la derecha verás cuánto hace de la última actualización.
Si quieres ver los cambios de inmediato, presiona **Actualizar**.

Si la actualización falla (por ejemplo, se cayó el internet), aparece un
**recuadro rojo** arriba con el problema y el botón **Reintentar**. Mientras
tanto se siguen mostrando los últimos datos que se cargaron.

`[Captura: banner de error con el botón Reintentar]`

## 10. El Dashboard

`[Captura: dashboard visto por el admin]`

**Para todos los usuarios:**

| Elemento | Qué muestra |
|---|---|
| **Pedidos de hoy** | Pedidos del día sin contar cancelados. Debajo: cuántos se cancelaron. |
| **Pedidos activos** | Pedidos pendientes, en preparación o listos. La tarjeta se resalta cuando hay alguno. |
| **Platillos disponibles** | Platillos del menú que se pueden vender ahora, de cuántos hay en total. |
| **Ventas del día** | Pedidos entregados hoy. |
| **Lista "Pedidos activos"** | Los pedidos en curso, **el que lleva más tiempo esperando primero**, con cuánto hace que se registró (*hace 12 min*), tipo de entrega, total y estado. **Ir a pedidos →** lleva a la pantalla de Pedidos. |

**Solo para el admin** (sección *Solo admin · Ventas e ingresos*):

| Elemento | Qué muestra |
|---|---|
| **Ingresos de hoy** | Suma de los pedidos entregados hoy. Debajo: cuánto falta por cobrar de los pedidos en curso. |
| **Esta semana** | Ingresos desde el lunes hasta hoy y cuántos pedidos se entregaron. |
| **Este mes** | Ingresos desde el día 1 del mes hasta hoy y cuántos pedidos se entregaron. |
| **Ticket promedio** | Lo que gasta en promedio cada pedido entregado este mes. |
| **Ingresos de los últimos 7 días** | Gráfico de barras: una barra por día; la de hoy es de color vino y muestra su monto. Pasa el mouse (o toca con el teclado) sobre una barra para ver el día, el monto y los pedidos. **Ver como tabla** muestra los mismos datos en una tabla. |
| **Platillos más vendidos (7 días)** | Los 5 platillos con más unidades pedidas en la última semana (sin contar cancelados), con lo que han generado. |
| **Pedidos de hoy por estado** | Cuántos pedidos de hoy hay en cada estado y qué porcentaje representan. |

Las ventas e ingresos cuentan **solo pedidos entregados**; los cancelados y
los que siguen en curso no suman.

`[Captura: gráfico de 7 días y sección del admin]`

## 11. Mensajes frecuentes y qué hacer

| Mensaje | Qué significa / qué hacer |
|---|---|
| *El nombre del cliente es obligatorio.* | Escribe el nombre del cliente (mínimo 2 letras). |
| *Ingresa un teléfono válido de 8 dígitos (ej. 7012-3456).* | El número debe tener 8 dígitos y empezar con 2, 6 o 7. Si no lo tienes, deja el campo vacío. |
| *El teléfono es obligatorio para pedidos a domicilio.* | Pide el número al cliente; el repartidor lo necesita. |
| *La dirección es obligatoria para pedidos a domicilio.* | Escribe la dirección de entrega. |
| *Escribe una dirección más completa (colonia, pasaje, número de casa).* | La dirección es muy corta; agrega más detalle. |
| *El pago con tarjeta no está disponible a domicilio: el POS solo está en el local.* | Cobra en efectivo, o cambia el tipo de entrega si el cliente pasará al local. |
| *Agrega al menos un platillo al pedido.* | Usa **+** en algún platillo disponible. |
| *Se agotó y no se incluirá en el pedido: …* | Ese platillo se agotó mientras armabas el pedido. Consulta con el cliente. |
| *No se puede pasar un pedido de "…" a "…".* | Otra persona ya cambió el estado de ese pedido. La tarjeta se actualiza sola con el estado real. |
| *El pedido no existe o ya fue eliminado.* | Otro usuario lo eliminó. La lista se actualiza sola. |
| *No se pudo conectar con el servidor. Revisa tu conexión.* | Revisa el internet y presiona **Reintentar** en el recuadro rojo. Los últimos datos se siguen mostrando. |
| *Tu sesión expiró. Vuelve a iniciar sesión.* | Presiona **Salir** e inicia sesión de nuevo. |

## 12. Limitaciones de esta versión

Esta es la versión web de la Etapa 2, todavía sin base de datos definitiva:

- Los pedidos se guardan temporalmente en el servidor. En la versión
  publicada pueden **reiniciarse a los pedidos de ejemplo** después de un
  rato sin uso, o verse distintos entre dos dispositivos por unos segundos.
  No debe usarse todavía como único registro de ventas.
- Los pedidos de días anteriores y las ventas de la semana y del mes que se
  ven en esta versión son **datos de ejemplo** para la demostración.
- Registrar un pedido **no descuenta el stock** del platillo: para marcar un
  platillo como agotado hay que hacerlo manualmente en **Menú**.
- Las próximas etapas agregarán base de datos real, pedidos desde el bot de
  WhatsApp y la app móvil.
