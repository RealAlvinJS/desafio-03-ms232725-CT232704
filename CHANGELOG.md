# Changelog — TicketTracker

Registro de avance por hito, basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Git guarda *qué* cambió; este archivo guarda *qué se logró, por qué se decidió así y qué falta*.
Se actualiza al cerrar cada hito, junto con su commit. Los hitos están definidos en [PLANNING.md](PLANNING.md).

---

## [H5] Crear ticket (POST) — 2026-10-09

### Agregado
- `create.tsx`: formulario con título, departamento (chips desde SQLite), prioridad (chips con color), descripción con contador, responsable y URL de evidencia opcional.
  Muestra "Se registrará como Abierto" y el CTA con gradiente vivo y estado de carga.
- `CustomInput`: pill con label, borde animado (morado al enfocar, rojo con error), hint y `FieldError` animado (fade + `translateY 4`), reutilizado en los grupos de chips.
- `utils/validation.ts`: `validateTicket` (requeridos, longitudes, URL HTTPS opcional), `validateDepartmentName` y límites centralizados.
- `DepartmentsContext`: lista de SQLite y `addDepartment` / `renameDepartment` / `removeDepartment` con validación, unicidad y bloqueo de departamentos en uso (adelantado desde H7, porque el formulario lo necesita).
- `TopInsetCover`: tapa la barra de estado en pantallas con scroll.
- `FilterChips`: valor opcional (`null`) y layout `wrap`.

### Decisiones
- Los errores aparecen tras el primer intento de envío y luego se recalculan en vivo mientras el usuario corrige.
- La prioridad empieza sin elegir: se fuerza una decisión consciente en lugar de asumir "Media".
- La URL se valida con una regex y no con `URL`, porque la implementación de React Native no expone todos sus getters.
- Teclado: `automaticallyAdjustKeyboardInsets` en el ScrollView en lugar de `KeyboardAvoidingView`, que no desplazaba el campo enfocado dentro de la tab.
- El CTA va al final del formulario y no fijo sobre el navbar (DESIGN.md actualizado).
- Al crear: haptic de éxito, formulario limpio, scroll al inicio y regreso al listado, donde el ticket ya aparece sin refetch.

### Problemas
- Mensaje "La descripción es obligatorio" → los errores ahora concuerdan en género.
- El lint de React Compiler marcó un `setState` dentro de un efecto en `DepartmentsContext`; la carga inicial se movió al callback de la promesa, con guarda de desmontaje.
- Mismo error transitorio de provider durante la recarga en caliente (se resolvió reiniciando la app).

### Verificado
- `npm run check` sin errores; reglas de validación probadas con un script (11/11).
- En el simulador:
  - Al enviar vacío aparecen los 5 errores y los bordes rojos.
  - El foco se ve en morado y el teclado ya no tapa el campo enfocado.
  - Se creó "Monitor parpadea en Recepcion" (TI, Media): MockAPI guardó el #13 con `status: open`, `createdAt` ISO e `imageUrl` vacío.
  - La app volvió al listado con 7 abiertos y 13 de 13, con el ticket primero en "Media" y "hace un momento".
  - El formulario quedó limpio.

### Pendiente
- El ticket #13 de prueba sigue en MockAPI; se usará para probar la eliminación en H6.

---

## [H4] Estado global y listado (GET) — 2026-10-09

### Agregado
- `TicketsContext` (`useReducer` + `use()` de React 19) con `fetchTickets`, `addTicket`, `editTicket` y `removeTicket`.
  - Arranque cache-first: pinta la caché de SQLite y luego la reemplaza con `GET /tickets`.
  - Si el GET falla con caché → `isOffline`; sin caché → estado de error.
  - Las mutaciones actualizan el estado y la caché con la respuesta del servidor y lanzan errores ya traducidos.
- Pantalla Tickets con composición split:
  - Header blanco con logo, nombre, botón de ajustes y dos stat cards con gradiente (Abiertos / Alta prioridad), que funcionan como filtros rápidos.
  - Zona negra con `SegmentedControl` de estado, `FilterChips` de prioridad, título con contador "N de M" y FlatList de `ItemCard`.
- Estados explícitos: carga, error con "Reintentar", sin tickets, sin resultados con "Limpiar filtros" y banner "Sin conexión".
- Pull-to-refresh, orden por prioridad y luego por fecha, y navegación a `detail/[id]` con el id por parámetro.
- `utils/tickets.ts` (`sortTickets`, `filterTickets`, `countBy`) y `utils/format.ts` (fecha relativa y completa con `Intl` creado una sola vez).
- Componentes nuevos: `SegmentedControl`, `FilterChips`, `ItemCard`, `StatCard` y `OfflineBanner`; variante `inverse` en `Button` y tono `muted` en `IconButton`.

### Decisiones
- La lista entra una sola vez (fade + `translateY` en el contenedor) y los filtros reacomodan con `itemLayoutAnimation`; no hay `entering` por fila.
- Los stat cards alternan su filtro (tocar uno activo lo quita) y muestran una X cuando están activos.
- El segmented en la zona negra usa pill blanco con texto oscuro; en zonas claras, pill negro con texto blanco.
- `StateMessage` recibe una `action` genérica (etiqueta + ícono + handler) en lugar de un `onRetry` fijo.
- Contadores de los stat cards sobre todos los tickets, para que coincidan con lo que muestra el filtro al tocarlos.

### Problemas
- Los stat cards colapsaban: el `flex: 1` estaba en la vista interna del `Pressable` y no en un contenedor; se envolvieron en un `View` flexible.
- "Reintentar" era invisible (pill negro sobre la zona negra) → variante `inverse`.
- Un error transitorio "useTickets debe usarse dentro de TicketsProvider" apareció solo durante la recarga en caliente, mientras `index` y `_layout` se guardaban por separado.

### Verificado
- `npm run check` sin errores.
- En el simulador iOS:
  - Se ven los 12 tickets de MockAPI ordenados por prioridad.
  - El stat card "Abiertos" filtra 6 de 12 y mueve el segmented; combinado con "Media" quedan 2, ordenados por fecha.
  - La card abre `detail/8`.
- Modo sin conexión: con un proxy local hacia MockAPI se cargó la caché, se apagó el proxy y al reabrir la app aparecen los 12 tickets con el banner "Sin conexión".
- Estado de error: con una URL sin caché ni servidor se muestra "No se pudieron cargar los tickets" con el mensaje traducido y "Reintentar".

### Pendiente
- El spinner del pull-to-refresh no se alcanzó a ver en captura (el gesto sí responde); revisarlo en la demo.
- "Sin resultados" no es alcanzable con el seed actual (todas las combinaciones tienen tickets); se revisará con `break-ui` en H8.

---

## [H3] Navegación y componentes base — 2026-10-09

### Agregado
- Layout raíz con `GestureHandlerRootView` y `SQLiteProvider`, que corre `migrateDatabase` al abrir la base.
- `TabBar` flotante: pill con 3 ítems circulares e indicador con anillo de gradiente que se desliza (250 ms, ease-in-out) + `Haptics.selectionAsync()` al cambiar.
  El contenedor se adapta a la zona (oscuro sobre el listado, gris translúcido sobre pantallas claras). `useTabBarInset()` da el espacio que deben reservar las pantallas.
- `PressableScale`: base de todo lo presionable (escala 0.97 en 120 ms al presionar, `hitSlop` hasta 44 pt).
- `GradientButton` (CTA con gradiente vivo y estado de carga), `Button` (secundario / destructivo), `IconButton`, `Badge` de estado, `LoadingSpinner`, `StateMessage` (vacío / error con "Reintentar") y `Logo` TT.
- Tokens nuevos: `motion.indicator`, `motion.easeInOut` y `navbar`.

### Decisiones
- Navbar propio en lugar de `NativeTabs`: el diseño flotante con indicador no se logra con el nativo. Las tabs no animan su contenido (`animation: 'none'`).
- El press usa shared value + `withTiming` en lugar de transiciones CSS: Reanimated 4.5 no acepta `cubic-bezier()` como string y los tipos de estilo de RN 0.86 chocan con su helper `cubicBezier`.
- **Corrección a DESIGN.md**: no se usa `entering` en filas del FlatList (se re-dispara al hacer scroll); en H4 se anima el contenedor una sola vez y se usa `itemLayoutAnimation` para reacomodos.
- Los indicadores (navbar y segmented) usan ease-in-out a 250 ms, porque se desplazan en pantalla en vez de entrar o salir (receta de `animate-expo`).
- Con movimiento reducido, el gradiente se fija en el tramo morado/magenta en lugar del azul inicial.
- Logo rediseñado: dos T del mismo tamaño, un solo gradiente continuo y un corte dibujado detrás de la T delantera para no adelgazarla.
- Regla de lint `import/no-named-as-default-member` desactivada para conservar `axios.create`, tal como lo muestra el enunciado.

### Problemas
- `StyleSheet.absoluteFillObject` ya no existe en RN 0.86 → insets explícitos.
- `expo start --ios` agotó el tiempo al abrir `exp://` en el primer arranque del simulador; se resolvió levantando Metro y abriendo la URL por separado.
- Las capturas del simulador a veces muestran el frame anterior: se espera 1–2 s antes de capturar.

### Verificado
- `npm run check` sin errores.
- En el simulador iOS (iPhone 17 Pro, Expo Go SDK 57):
  - SQLite migra dentro de la app y lista los 6 departamentos.
  - El navbar cambia de tab con el indicador deslizándose y el contenido no se anima.
  - El gradiente del CTA se desplaza y el estado de carga muestra el spinner.
  - Con movimiento reducido activo, dos capturas separadas 3 s son idénticas.
  - `detail/1` recibe el parámetro y el navbar no aparece en el detalle.

### Pendiente
- Las pantallas de tabs muestran una vitrina temporal de componentes (se reemplaza en H4–H7).

---

## [H2] Backend y capa de servicios — 2026-10-09

### Agregado
- `docs/seed-tickets.json`: 12 tickets coherentes que cubren las 9 combinaciones de prioridad × estado, en los 6 departamentos, con fotos HTTPS de Unsplash revisadas una por una.
- `scripts/seed-mockapi.mjs` + `npm run seed` / `seed:reset`: carga el seed en MockAPI leyendo la URL del `.env`.
- MockAPI poblado: `GET /tickets` devuelve los 12 tickets con ids 1–12.
- `services/api.ts`: instancia Axios, `getBaseUrl`/`setBaseUrl` y `getErrorMessage`, que traduce timeout, sin conexión, 404 y 5xx a mensajes en español.
- `services/resourceService.ts`: `getItems`, `getItemById`, `createItem`, `updateItem` (PATCH) y `deleteItem`, con la normalización `toTicket`.
- `db/database.ts`: migraciones versionadas con `PRAGMA user_version`, en WAL; la v1 crea `departments` y `tickets_cache` e inserta los 6 departamentos por defecto.
- `db/departmentRepository.ts` y `db/ticketCacheRepository.ts`: funciones SQL puras que reciben la base (sin React).

### Decisiones
- La baseURL no lleva `/api/v1`: el proyecto de MockAPI se creó sin prefijo.
- **PATCH** para actualizar: MockAPI lo soporta y hace merge parcial, que es la semántica correcta para cambiar estado o asignado.
- `TicketInput` ya no incluye `status`: `createItem` siempre envía `open`, así la regla "todo ticket nace Abierto" vive en un solo lugar.
- `createItem` siempre envía `createdAt` (ISO) e `imageUrl`: si faltan, MockAPI pone un timestamp numérico y un texto basura (`"imageUrl 13"`).
- `toTicket` normaliza lo leído: timestamps numéricos → ISO e `imageUrl` que no sea HTTPS → `undefined`.
- "Departamento en uso" se resuelve en SQL con `json_extract` sobre la caché, sin depender del estado de React.
- La caché guarda la baseURL de origen: copias de otra URL se ignoran y un reemplazo total limpia todo.

### Problemas
- La búsqueda de Unsplash devolvió dos fotos poco coherentes (un render 3D y un setup gamer); se reemplazaron por otras más adecuadas.
- `tsx` necesita la extensión `.mts` para ejecutar scripts con `await` de nivel superior.

### Verificado
- `npm run check` sin errores.
- Contra MockAPI real: `getItems` → 12 tickets con fechas ISO e imágenes HTTPS; `getItemById`; 404 y red caída devuelven mensajes controlados; ciclo crear → PATCH → borrar sin dejar residuos.
- SQL de los repositorios probado con `node:sqlite` mediante un adaptador con la interfaz de expo-sqlite: migración idempotente, seed de 6 departamentos, unicidad sin distinguir mayúsculas, rename/delete, caché por baseURL, upsert/delete y conteo por departamento.

### Pendiente
- Probar SQLite en un dispositivo o simulador real cuando se monte `SQLiteProvider` (H3).

---

## [H1] Scaffold y fundamentos — 2026-10-09

### Agregado
- Proyecto Expo **SDK 57** (React Native 0.86, React 19.2) con expo-router en `src/app/`, creado con `create-expo-app` (template default) y limpiado de ejemplos.
- `tsconfig` estricto: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`.
- ESLint (`eslint-config-expo` + `eslint-config-prettier`, `no-explicit-any` como error) y Prettier; scripts `typecheck`, `lint`, `check` y `format`.
- Dependencias: `axios`, `expo-sqlite`, `expo-linear-gradient`, `expo-haptics`, `react-native-svg`, `lucide-react-native`, `@expo-google-fonts/plus-jakarta-sans` (Reanimated 4.5 y Worklets ya venían en el template).
- `types/Entity.ts` (`EntityItem`, `Ticket`, `TicketInput`, `TicketUpdate`, `Department`), `constants/config.ts`, `constants/tickets.ts` y `constants/theme.ts` con todos los tokens de DESIGN.md.
- Layout raíz con carga de fuentes y splash; Tabs provisionales (Tickets / Nuevo / Ajustes) y ruta `detail/[id]` con placeholders.
- `app.json`: nombre TicketTracker, interfaz clara y splash/ícono Android en `ink`.
- README inicial y `.claude/launch.json` para previsualizar en web.
- Repositorio público: https://github.com/RealAlvinJS/desafio-03-ms232725-CT232704

### Decisiones
- Se partió del template `default` (ya trae `src/app`, Reanimated y Worklets) en lugar de `blank-typescript`.
- Se quitaron dependencias del template que no se usan: `@expo/ui`, `expo-device`, `expo-glass-effect`, `expo-symbols` y `expo-web-browser`.
- Se conserva `expo-image` para las imágenes de evidencia (recomendación de `vercel-react-native-skills`).
- `AGENTS.md` del template se mantiene: obliga a consultar la documentación versionada de Expo antes de usar sus APIs.
- Los valores de dominio se guardan en inglés (`open`, `high`) y los labels/colores salen de `STATUS_META` / `PRIORITY_META`.
- El PDF del curso y la imagen de referencia de diseño quedan fuera del repo (`.gitignore`), porque son material de terceros.

### Problemas
- `npm audit` reporta vulnerabilidades en dependencias de herramientas del CLI (braces, node-forge, uuid), no en código que llega a la app; se ignoran porque `audit fix --force` rompería el SDK.

### Verificado
- `npm run check` y `expo-doctor` (21/21) sin errores.
- En web: las 3 tabs navegan, las fuentes cargan, `detail/1` recibe el parámetro y la consola queda sin errores.

### Pendiente
- `ScreenPlaceholder` es temporal: se elimina cuando cada pantalla se implemente (H4–H7).
- Tabs provisionales nativas → navbar flotante animado en H3.

---

## [H0] Planificación — 2026-10-09

### Agregado
- `PLANNING.md`: arquitectura en capas, estructura `src/` del PDF, alcance, reglas de negocio e hitos H1–H8 con criterios de terminado.
- `DESIGN.md`: tokens, composición split blanco/negro, componentes y catálogo de animaciones.
- `CLAUDE.md`: reglas del proyecto para cualquier sesión de trabajo.
- Skills del proyecto en `.claude/skills/`: `emil-design-eng`, `animate-expo`, `break-ui`, `review-animations`,
  `frontend-design`, `vercel-react-native-skills`, `vercel-composition-patterns`.
- Referencia visual en `docs/design-reference.webp`.

### Decisiones
- Opción elegida: **App de Soporte Técnico y Control de Tickets**, con el nombre **TicketTracker** y el monograma TT provisional.
- Flujo de estados **libre**, pero todo cambio pasa por un Alert de confirmación; un ticket Resuelto no se reasigna.
- La baseURL editada en Ajustes vive solo en memoria y se restaura con `DEFAULT_BASE_URL`.
- Tickets: **MockAPI es la fuente de verdad** (la rúbrica exige CRUD con Axios); `expo-sqlite` guarda una caché de solo lectura para abrir rápido y funcionar sin conexión.
- Departamentos: editables y guardados **solo en SQLite**; no se elimina uno en uso y renombrar solo afecta a los tickets nuevos.
- Se usa FlatList (lo exige el PDF) aunque `vercel-react-native-skills` sugiera FlashList.
- Diseño: base blanco y negro con un espectro tipo Gemini (morado y rojo como principales); el gradiente animado se reserva al CTA primario y al logo.
- Animaciones con criterio: el indicador del navbar se desliza, pero el contenido de las tabs no; cada animación debe tener un propósito.
- Se permiten librerías de UI más allá de `StyleSheet` (confirmado con el docente).
- Comentarios con `//`, máximo 2 líneas, solo para lógica de negocio.

### Pendiente
- URL del recurso `/tickets` en MockAPI (la crea Alvin con el seed de H2).
