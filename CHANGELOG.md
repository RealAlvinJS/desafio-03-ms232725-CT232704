# Changelog — TicketTracker

Registro de avance por hito, basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Git guarda *qué* cambió; este archivo guarda *qué se logró, por qué se decidió así y qué falta*.
Se actualiza al cerrar cada hito, junto con su commit. Los hitos están definidos en [PLANNING.md](PLANNING.md).

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
