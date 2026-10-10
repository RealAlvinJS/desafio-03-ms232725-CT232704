# Planning — TicketTracker (Desafío Práctico 3: Helpdesk / Control de Tickets)

Diseño y animaciones: ver [DESIGN.md](DESIGN.md).

Stack obligatorio: **Expo + expo-router + TypeScript estricto + Axios + MockAPI.io**.
Prioridad del desafío: código limpio, modular y legible por encima de cantidad de features.

---

## Fase 1 — Arquitectura y estructura

### 1.1 Capas

```
UI (src/app, src/components)
   │  usa
   ▼
Estado (src/context/TicketsContext, DepartmentsContext)
   │  llama                                   │  llama
   ▼                                          ▼
Servicios (src/services/resourceService)   Repositorios (src/db/*Repository)
   │  usa                                     │  usa
   ▼                                          ▼
Cliente HTTP (src/services/api)            SQLite local (src/db/database)
   │                                          ├── departments     ← fuente de verdad
   ▼                                          └── tickets_cache   ← copia de MockAPI
MockAPI.io  /tickets  ← fuente de verdad de los tickets
```

Reglas de dependencia:
- Las pantallas **nunca** importan `axios` ni `api` directamente; solo el contexto o el servicio.
- `resourceService` y los repositorios no conocen React; solo reciben/retornan tipos de `types/`.
- Solo los contextos combinan API + DB local; las pantallas no saben de dónde vienen los datos.
- Constantes (estados, prioridades, colores) viven en `constants/` — cero strings mágicos en pantallas. Los departamentos viven en SQLite.

### 1.2 Estructura de carpetas

Se respeta la estructura del PDF al pie de la letra (marcado ✅) y se agregan solo las piezas
mínimas necesarias para no meter lógica en las pantallas (marcado ➕).

```
src/
├── app/
│   ├── _layout.tsx              ✅ Stack raíz + init SQLite + providers
│   ├── (tabs)/
│   │   ├── _layout.tsx          ✅ Tabs: Tickets / Nuevo / Ajustes
│   │   ├── index.tsx            ✅ GET + FlatList + filtros por chips
│   │   ├── create.tsx           ✅ Formulario POST con validación
│   │   └── settings.tsx         ✅ baseURL + gestión de departamentos
│   └── detail/
│       └── [id].tsx             ✅ GET by id, PATCH estado/reasignar, DELETE
├── services/
│   ├── api.ts                   ✅ Instancia Axios + setBaseUrl()
│   └── resourceService.ts       ✅ getItems, getItemById, createItem, updateItem, deleteItem
├── db/
│   ├── database.ts              ➕ Apertura de SQLite, migraciones y seed de departamentos
│   ├── departmentRepository.ts  ➕ list, create, rename, remove (SQL)
│   └── ticketCacheRepository.ts ➕ readAll, replaceAll, upsert, remove (SQL)
├── context/
│   ├── TicketsContext.tsx       ➕ Estado global del listado (useReducer) + caché
│   └── DepartmentsContext.tsx   ➕ Departamentos editables desde SQLite
├── components/
│   ├── ItemCard.tsx             ✅ Tarjeta del ticket en el FlatList
│   ├── CustomInput.tsx          ✅ Input con label + mensaje de error
│   ├── LoadingSpinner.tsx       ✅ ActivityIndicator centrado
│   ├── FilterChips.tsx          ➕ Chips de prioridad / departamento
│   ├── SegmentedControl.tsx     ➕ Selector con pill deslizante (estado / prioridad)
│   ├── Badge.tsx                ➕ Badge de estado (outline + ícono)
│   ├── GradientButton.tsx       ➕ CTA primario con gradiente animado
│   ├── IconButton.tsx           ➕ Botón circular
│   ├── TabBar.tsx               ➕ Navbar flotante con indicador animado
│   ├── Logo.tsx                 ➕ Monograma TT con gradiente (SVG)
│   └── StateMessage.tsx         ➕ Estado vacío / error de red con botón "Reintentar"
├── types/
│   └── Entity.ts                ✅ EntityItem + Ticket + unions de estado/prioridad
├── utils/
│   ├── validation.ts            ➕ validateTicket(), validateDepartment()
│   └── format.ts                ➕ formatDate() amigable (es-SV)
└── constants/
    ├── config.ts                ✅ DEFAULT_BASE_URL, TIMEOUT
    ├── tickets.ts               ➕ STATUSES, PRIORITIES, labels y DEFAULT_DEPARTMENTS (seed inicial)
    └── theme.ts                 ➕ Tokens de DESIGN.md (colores, tipografía, radios, motion)
```

### 1.3 Tipado (`types/Entity.ts`)

Se conserva `EntityItem` del PDF y se **especializa** para tickets, mapeando:
`title` → título del problema, `category` → departamento, `status` → estado.

```ts
export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketPriority = 'high' | 'medium' | 'low';

export interface EntityItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
}

export interface Ticket extends EntityItem {
  status: TicketStatus;
  priority: TicketPriority;
  description: string;
  assignee: string;
}

// El estado no viaja en la entrada: el servicio fija el inicial.
export type TicketInput = Omit<Ticket, 'id' | 'createdAt' | 'status'>;

export interface Department {
  id: number;
  name: string;
  createdAt: string;
}
```

- Valores guardados en inglés (`open`, `high`…) y **labels en español** desde `constants/tickets.ts`.
- `tsconfig.json`: `"strict": true` + `"noUncheckedIndexedAccess": true`.

### 1.4 Backend MockAPI — recurso `/tickets`

| Campo         | Tipo     | Ejemplo                                   |
|---------------|----------|-------------------------------------------|
| `id`          | string   | `"1"` (autogenerado)                      |
| `title`       | string   | `"Impresora del 2do piso no imprime"`     |
| `category`    | string   | `"Recursos Humanos"` (departamento)       |
| `priority`    | string   | `"high"`                                  |
| `status`      | string   | `"open"`                                  |
| `description` | string   | `"Muestra error de atasco de papel…"`     |
| `assignee`    | string   | `"Carlos Méndez"`                         |
| `imageUrl`    | string   | URL HTTPS de evidencia/captura del fallo  |
| `createdAt`   | string   | ISO date                                  |

- **Mínimo 10 registros** seed coherentes (mezcla de prioridades, estados y departamentos) con imágenes HTTPS funcionales.
- Seed en `docs/seed-tickets.json`, cargado con `npm run seed` (`scripts/seed-mockapi.mjs`).
- La baseURL no lleva prefijo (`https://<id>.mockapi.io`) y se lee de `EXPO_PUBLIC_API_URL`.
- Actualizaciones con **PATCH** (MockAPI hace merge parcial).

### 1.5 Base de datos local (`expo-sqlite`)

```sql
CREATE TABLE departments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL
);

CREATE TABLE tickets_cache (
  id       TEXT PRIMARY KEY,
  base_url TEXT NOT NULL,   -- de qué endpoint vino la copia
  data     TEXT NOT NULL    -- Ticket serializado en JSON
);
```

- Migraciones versionadas con `PRAGMA user_version`; en la primera ejecución se insertan los `DEFAULT_DEPARTMENTS`
  (TI, Recursos Humanos, Finanzas, Operaciones, Ventas, Administración).
- **Departamentos**: SQLite es su única fuente de verdad (no existen en MockAPI).
- **Tickets**: MockAPI es la fuente de verdad; `tickets_cache` es solo una copia para abrir rápido y leer sin conexión.

### 1.6 Estado y flujo de datos

`TicketsContext` expone: `tickets`, `loading`, `error`, `isOffline`, `fetchTickets`, `addTicket`, `editTicket`, `removeTicket`.
`DepartmentsContext` expone: `departments`, `addDepartment`, `renameDepartment`, `removeDepartment`.

- **Arranque cache-first**: se pinta la caché de SQLite al instante y en paralelo se hace `GET /tickets`;
  la respuesta reemplaza el estado y la caché.
- Si el GET falla y hay caché → se muestran los datos guardados con un banner "Sin conexión" (`isOffline`).
  Sin caché → estado de error con "Reintentar".
- Tras un POST/PATCH/DELETE **exitoso** se actualizan el estado y la caché con la respuesta del servidor → el listado se refresca sin refetch completo.
- Las escrituras requieren conexión: si fallan se muestra el error y no se toca nada local.
- Pull-to-refresh en el listado para forzar `GET`.
- Al cambiar la baseURL se descarta la caché de otra URL, se limpia el estado y se vuelve a cargar.

### 1.7 Herramientas

- `npx create-expo-app` (template TypeScript con expo-router), mover `app/` a `src/app/`.
- `axios` para red, `expo-sqlite` para la DB local; dependencias de UI listadas en DESIGN.md §10.
- ESLint (`npx expo lint`) + Prettier.
- Repo público en GitHub desde el día 1, commits pequeños por feature.

---

## Fase 2 — Alcance y limitaciones (propuesta para validar)

### 2.1 Funcionalidades IN (lo que sí se construye)

**Listado (`index.tsx`)**
- FlatList ordenado por prioridad (Alta → Media → Baja) y luego por fecha descendente.
- Stat cards (Abiertos / Alta prioridad) que funcionan como filtros rápidos.
- Segmented de **estado** + chips de **prioridad** (combinables, "Todos" por defecto).
- Tarjeta: título, departamento, badge de prioridad, badge de estado, asignado, fecha amigable.
- Estados explícitos: cargando, error de red con "Reintentar", lista vacía, filtro sin resultados.
- Banner "Sin conexión · mostrando datos guardados" cuando se sirve desde la caché.

**Crear (`create.tsx`)**
- Campos: título, departamento (chips desde SQLite), prioridad (segmented), descripción, asignado, URL de evidencia (opcional).
- Sin departamentos registrados → mensaje con acceso directo a Ajustes.
- Estado inicial forzado a `open` (no lo elige el usuario).
- Validación: requeridos, longitudes mínimas, URL HTTPS válida si se proporciona.
- Botón deshabilitado + spinner mientras envía; al éxito limpia el form y navega al listado.

**Detalle (`detail/[id].tsx`)**
- GET por id (no depende de lo que haya en memoria).
- Cambiar estado con **Alert de confirmación** antes del PATCH.
- Reasignar ticket (input + guardar con confirmación).
- Eliminar con Alert destructivo y regreso al listado.

**Ajustes (`settings.tsx`)**
- Mostrar baseURL actual, editarla, restaurar la por defecto y "Probar conexión".
- Sección **Departamentos**: listar, agregar, renombrar y eliminar (con Alert de confirmación).

### 2.2 Reglas de negocio

1. Todo ticket nace en estado **Abierto**.
2. Flujo de estados **libre**: cualquier estado puede pasar a otro, siempre con Alert de confirmación.
3. Un ticket **Resuelto** no se puede reasignar.
4. Eliminar siempre requiere confirmación explícita.
5. Nombre de departamento: requerido, 2–40 caracteres y único sin distinguir mayúsculas.
6. No se puede eliminar un departamento **en uso** por algún ticket (según la última copia conocida).
7. Renombrar un departamento solo afecta a los tickets nuevos; los existentes conservan el nombre con el que se crearon.

### 2.3 Funcionalidades OUT (fuera de alcance)

- Autenticación, roles o usuarios reales (el "asignado" es texto libre).
- Comentarios/historial del ticket, adjuntar imágenes desde la galería (solo URL).
- Paginación, búsqueda por texto, notificaciones push.
- Escritura offline / sincronización diferida (offline es solo lectura vía caché).
- Persistencia de la baseURL entre reinicios (solo vive en memoria; se restaura con `DEFAULT_BASE_URL`).
- Tema oscuro.

### 2.4 Convenciones de código

- Identificadores en inglés, textos de UI en español.
- Componentes funcionales, props tipadas con `interface`, sin `any`.
- Comentarios con `//`: **máximo 2 líneas, concisos, solo para lógica de negocio** (reglas, decisiones), nunca para narrar código obvio.
  Ejemplo: `// Todo ticket nace Abierto; el usuario no elige el estado inicial.`

---

## Fase 3 — Hitos de implementación

Cada hito cierra con `tsc --noEmit` y lint limpios, su entrada en [CHANGELOG.md](CHANGELOG.md), al menos un commit (`feat: …` / `chore: …`) y push al repo.
Los componentes se construyen **completos desde el inicio** (con su animación definida en DESIGN.md); el hito 8 es solo pulido.

### H1 — Scaffold y fundamentos
Proyecto Expo con expo-router dentro de `src/`, tipado estricto y tokens de diseño listos para consumir.
- `create-expo-app` (TypeScript), mover `app/` a `src/app/`, `tsconfig` con `strict` + `noUncheckedIndexedAccess`.
- Dependencias de DESIGN.md §10 + `axios`, ESLint + Prettier.
- `types/Entity.ts`, `constants/config.ts`, `constants/tickets.ts`, `constants/theme.ts`.
- Repo Git + repositorio público en GitHub.

**Terminado cuando:** `npx expo start` abre la app con las 3 tabs y la ruta `detail/[id]` como placeholders, las fuentes cargan y el primer commit está en GitHub.

### H2 — Backend y capa de servicios
Fuente de datos real y acceso HTTP centralizado.
- `docs/seed-tickets.json` con 12 tickets coherentes (todas las combinaciones de prioridad/estado, varios departamentos, imágenes HTTPS).
- Recurso `/tickets` en MockAPI cargado con el seed (lo crea Alvin).
- `api.ts` (instancia + `setBaseUrl`) y `resourceService.ts` (`getItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem`).
- Normalizar los errores de Axios a un mensaje legible en español.
- `db/database.ts` (migraciones + seed de departamentos), `departmentRepository` y `ticketCacheRepository`.

**Terminado cuando:** `getItems()` devuelve 10 o más tickets tipados, un error de red produce un mensaje controlado (sin crash)
y al primer arranque la tabla `departments` tiene los 6 departamentos por defecto.

### H3 — Navegación y componentes base
Esqueleto visual y de navegación sobre el que se montan las pantallas.
- `app/_layout.tsx`: carga de fuentes, `SQLiteProvider`, `DepartmentsProvider`, `TicketsProvider` y Stack raíz.
- `TabBar` flotante con indicador deslizante + haptic.
- `IconButton`, `GradientButton` (gradiente vivo), `Logo` TT, `Badge`, `LoadingSpinner` y `StateMessage`.

**Terminado cuando:** al cambiar de tab el indicador se desliza sin animar el contenido, el CTA muestra el gradiente en movimiento y, con movimiento reducido activo, todo queda estático.

### H4 — Estado global y listado (GET)
Pantalla principal completa. Cubre el criterio "Consumo y Renderizado (20 %)".
- `TicketsContext` (`useReducer`) con `fetchTickets`, `addTicket`, `editTicket` y `removeTicket`, cache-first sobre SQLite.
- `index.tsx` con composición split: stat cards, `SegmentedControl` de estado y `FilterChips` de prioridad.
- `ItemCard` + FlatList ordenado por prioridad y fecha, con pull-to-refresh.
- Navegación a `detail/[id]` pasando el id por parámetro.

**Terminado cuando:** se ven los estados de carga, error con "Reintentar", lista vacía y "sin resultados"; los filtros se combinan; la entrada escalonada ocurre solo en la primera carga y al tocar una card se abre el detalle correcto.
En modo avión, con caché previa, la lista aparece con el banner "Sin conexión".
**Capturas:** listado, filtros aplicados, carga, error de red y modo sin conexión.

### H5 — Crear ticket (POST)
Formulario validado. Cubre el criterio "Creación de Recursos (20 %)".
- `CustomInput` (foco y error animados) y `utils/validation.ts`.
- `create.tsx`: título, departamento (desde `DepartmentsContext`), prioridad, descripción, asignado y URL de evidencia opcional.
- Estado inicial forzado a `open`.

**Terminado cuando:** cada campo inválido muestra su error; el envío deshabilita el botón y muestra loading; al éxito el ticket aparece en el listado sin recargar, el formulario se limpia y se vuelve a Tickets.
**Capturas:** formulario vacío, errores de validación y ticket recién creado en la lista.

### H6 — Detalle, actualización y eliminación (GET / PATCH / DELETE)
Gestión completa de un ticket. Cubre "Actualización y Eliminación (20 %)" y "Navegación con parámetros (15 %)".
- `detail/[id].tsx` carga el ticket por id (con estados de carga y error).
- Cambio de estado vía segmented → `Alert` de confirmación → PATCH.
- Reasignación (bloqueada si el ticket está Resuelto) y eliminación con `Alert` destructivo.

**Terminado cuando:** cada cambio se refleja en el listado y en la caché sin refetch, el badge hace crossfade con un haptic de éxito y, tras eliminar, se vuelve al listado sin el ticket.
**Capturas:** detalle, alert de cambio de estado, reasignación y alert de eliminación.

### H7 — Ajustes: baseURL y departamentos
Pantalla `settings.tsx` según lo pedido en la estructura del PDF, más la gestión local de departamentos.
- Mostrar la URL actual, editarla (validando HTTPS), "Probar conexión" y "Restaurar por defecto".
- `DepartmentsContext` + sección Departamentos: agregar, renombrar (inline) y eliminar con Alert.

**Terminado cuando:** al cambiar la URL se descarta la caché, se limpia el estado y se recarga el listado; una URL inválida muestra un error controlado y "Restaurar" vuelve a `DEFAULT_BASE_URL`.
Los departamentos persisten tras cerrar la app; un nombre duplicado o un borrado de un departamento en uso se rechaza con un mensaje claro; uno nuevo aparece de inmediato en el formulario de creación.
**Capturas:** ajustes con la URL, prueba de conexión, alta/renombre de departamento y bloqueo de un borrado en uso.

### H8 — Pulido y entrega
Calidad final y material para la evaluación.
- `break-ui` sobre `ItemCard` y Detalle (títulos largos, campos vacíos, listas grandes) y corrección de lo que se rompa.
- `/review-animations` sobre los componentes animados.
- README: instalación, configuración de MockAPI, scripts y enlace al seed.
- Capturas finales y PDF de entrega con portada oficial (opción: Soporte Técnico y Control de Tickets).

**Terminado cuando:** no hay warnings en consola, el repo es público con README, el PDF está listo y el guion de demo de la defensa (agregar departamento → crear → filtrar → cambiar estado → reasignar → eliminar → modo avión → cambiar baseURL) corre de principio a fin sin errores.

---

## Skills del proyecto (`.claude/skills/`)

`emil-design-eng`, `animate-expo`, `break-ui`, `review-animations`, `frontend-design`,
`vercel-react-native-skills`, `vercel-composition-patterns`.

Prioridad cuando se contradicen:
- Listado: **FlatList** (lo exige el PDF) aunque `vercel-react-native-skills` sugiera FlashList.
- Animación: manda `animate-expo`; resto de buenas prácticas RN: `vercel-react-native-skills`.
- Componentes compuestos solo si un componente acumula props booleanas; por defecto props tipadas simples.
