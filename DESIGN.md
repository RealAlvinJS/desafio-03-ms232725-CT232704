# DESIGN.md — TicketTracker

Reglas de diseño y movimiento de la app. Referencia visual: [`docs/design-reference.webp`](docs/design-reference.webp).
Se toma de la referencia la **estructura, composición y lenguaje de formas**; la paleta de acento se reemplaza
(lima → espectro tipo Gemini con **morado y rojo** como protagonistas).

Toda constante de este documento vive en `src/constants/theme.ts`. Ningún color, radio o duración se escribe a mano en un componente.

---

## 1. Principio de movimiento: animado, pero con criterio

La app debe sentirse **dinámica**, pero cada animación necesita un propósito nombrable
(feedback, consistencia espacial, indicar estado, evitar un cambio brusco o deleite). Si no se puede nombrar, no se anima.

| Frecuencia de la interacción | Regla |
|---|---|
| Muy frecuente (cambiar de tab, scroll, escribir) | El **contenido no se anima**. Solo se mueve el indicador del navbar. |
| Frecuente (presionar, filtrar, abrir detalle) | Rápido y casi imperceptible: 100–200 ms. |
| Ocasional (crear, cambiar estado, eliminar) | Animación completa + haptic. |
| Rara (lista vacía, primer render) | Aquí vive el "deleite". |

Reglas duras (de las skills `animate-expo` y `emil-design-eng`):
- Solo se anima `transform` y `opacity`. Excepción: un indicador absoluto sin hijos (pill del navbar/segmented).
- Nunca `scale(0)`: las entradas parten de `scale 0.95` + `opacity 0`.
- UI ≤ 300 ms. Las transiciones entre pantallas usan las del stack nativo, sin sobrescribirlas.
- Todo con **Reanimated** (nunca el `Animated` del core), fuera del hilo JS.
- `useReducedMotion()` en cada animación: con movimiento reducido, el gradiente se queda estático y las entradas son solo fade.
- Haptic: uno por acción del usuario, en el mismo frame que el visual, nunca como único feedback.

---

## 2. Paleta

### 2.1 Base monocromática (de la referencia)

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#0A0A0A` | Zona negra, botones primarios sólidos, texto principal |
| `ink2` | `#171717` | Cards sobre zona negra |
| `ink3` | `#262626` | Chips, ítems inactivos del navbar sobre negro |
| `canvas` | `#ECECE9` | Fondo de pantallas claras |
| `surface` | `#FFFFFF` | Cards, inputs y botones circulares sobre `canvas` |
| `surfaceMuted` | `#F3F3F1` | Chips de etiqueta sobre `surface` |
| `border` | `#E2E2DE` | Divisores y bordes de badges outline |
| `textPrimary` | `#0A0A0A` | Texto sobre claro |
| `textSecondary` | `#6E6E6A` | Subtítulos, fechas |
| `textOnDark` | `#FFFFFF` | Texto sobre negro |
| `textOnDarkMuted` | `#A1A1A1` | Secundario sobre negro |

### 2.2 Espectro de acento (tipo Gemini)

| Token | Hex | Rol |
|---|---|---|
| `blue` | `#4F7BFF` | Inicio del gradiente, prioridad Baja |
| `purple` | `#7B5CFA` | **Principal**, estado Abierto |
| `magenta` | `#C64FD6` | Puente del gradiente, estado En proceso |
| `red` | `#F0435A` | **Principal**, prioridad Alta, acciones destructivas |
| `amber` | `#F5A524` | Prioridad Media |
| `green` | `#22B07D` | Estado Resuelto, éxito |

**Gradiente de marca** (`brandGradient`): `blue → purple → magenta → red`, en diagonal (de arriba-izquierda a abajo-derecha).
El azul solo aparece como chispa inicial; visualmente dominan el morado y el rojo.

### 2.3 Dónde va cada cosa

- **Gradiente animado**: solo en el CTA primario de cada pantalla (`Crear ticket`, `Guardar`) y en el logo. Nunca en fondos grandes.
- **Espectro**: en elementos pequeños (dots, íconos de badges, ícono activo del navbar, borde de foco del input). Es el "arcoíris" de detalle.
- **Negro sólido**: botones secundarios, botones circulares activos y el pill activo del segmented.
- **Rojo**: confirmaciones destructivas (eliminar). No se mezcla con el gradiente.

### 2.4 Mapeo de dominio

| Prioridad | Color | Estado | Color |
|---|---|---|---|
| Alta | `red` | Abierto | `purple` |
| Media | `amber` | En proceso | `magenta` |
| Baja | `blue` | Resuelto | `green` |

La prioridad se muestra como **dot de color + label**; el estado, como **pill outline con ícono de color**.
Así nunca compiten aunque compartan la misma card.

---

## 3. Tipografía

Fuente: **Plus Jakarta Sans** (`@expo-google-fonts/plus-jakarta-sans`), una grotesca geométrica cercana a la de la referencia.

| Token | Tamaño / alto de línea | Peso | Uso |
|---|---|---|---|
| `display` | 28 / 34 | 700 | Número de los stat cards |
| `title` | 22 / 28 | 600 | Título centrado del header |
| `heading` | 18 / 24 | 600 | Títulos de sección y de card |
| `body` | 15 / 22 | 400 | Descripciones |
| `label` | 14 / 18 | 500 | Botones, chips, segmented |
| `caption` | 12 / 16 | 500 | Fechas, metadatos |

Los números usan `fontVariant: ['tabular-nums']`.

---

## 4. Forma, espacio y elevación

- **Escala de espacio** (base 4): `4, 8, 12, 16, 20, 24, 32, 40`. Gutter de pantalla: **20**.
- **Radios**: `sm 12` · `md 20` · `lg 28` (cards) · `xl 36` (corte entre zonas) · `pill 999` (botones, inputs, chips, navbar).
- **Alturas**: botón 56 · input 56 · botón circular 48 · ítem del navbar 52 · chip 36.
- **Elevación**: la referencia es plana. La jerarquía sale del contraste `canvas`/`surface`/`ink`, no de sombras.
  La única sombra va en el navbar flotante (suave, `opacity 0.12`, `radius 24`).
- Touch target mínimo de 44×44; si el visual es menor, se usa `hitSlop`.

---

## 5. Composición de pantallas

### 5.1 Composición "split" (pantalla Tickets)

Esta es la firma visual de la referencia: un **panel claro superior con esquinas inferiores redondeadas (`xl 36`)
que "flota" sobre una zona negra**.

```
┌────────────────────────────┐  ← surface (blanco)
│ [TT]  TicketTracker   (⚙)  │     logo + nombre + botón circular
│                            │
│ ┌──────────┐ ┌──────────┐  │     stat cards = filtros rápidos
│ │ 05     → │ │ 03     → │  │     (Abiertos / Alta prioridad)
│ │ Abiertos │ │ Alta     │  │
│ └──────────┘ └──────────┘  │
╰────────────────────────────╯  ← radio xl en las esquinas inferiores
███ zona ink ███████████████
 (● Alta) (● Media) (● Baja)    chips de prioridad, scroll horizontal
 Tickets              4 de 12   título de sección + contador
 ┌──────────────────────────┐   cards ink2 sobre negro
 │ ...                      │
 └──────────────────────────┘
      ╭─────────────────╮       navbar flotante
```

- Los **stat cards** reemplazan los cards lima de la referencia: fondo `brandGradient` (uno con el morado
  dominante y otro con el rojo), texto blanco y un botón circular `ink` con flecha. Al tocarlos se aplica el filtro.
- La zona negra llena el resto de la pantalla; el FlatList vive dentro de ella.

### 5.2 Composición "light" (Nuevo, Detalle, Ajustes)

- Fondo `canvas`, contenido en cards `surface` de radio `lg`.
- **Header**: botón circular blanco a la izquierda (atrás, solo en Detalle) y título `title` centrado.
- El **CTA primario** va al final del contenido, justo encima del espacio del navbar. No se fija sobre el navbar
  porque, con el teclado abierto, un botón flotante tapa los campos.
- `TopInsetCover` tapa la barra de estado para que el contenido no se lea detrás de la hora al hacer scroll.

### 5.2.1 Composición "split invertido" (Nuevo ticket)

Misma firma que el home pero con los colores invertidos: **header negro con esquinas inferiores `xl`** sobre el
cuerpo `canvas`. Así las tabs se reconocen como familia y cada una tiene su propia identidad.

### 5.3 Pantallas

| Pantalla | Composición | Contenido clave |
|---|---|---|
| Tickets (`index`) | Split | Stat cards, segmented de estado, chips de prioridad y lista |
| Nuevo (`create`) | Split invertido + pasos | Formulario de 4 pasos (ver §5.4) |
| Detalle (`detail/[id]`) | Light | Card principal con la info, segmented de estado, reasignación y botón eliminar (outline rojo) |
| Ajustes (`settings`) | Light | Card con la baseURL ("Probar conexión", "Restaurar") + card Departamentos (lista editable, input pill + botón circular "+") |

### 5.4 Formulario por pasos (Nuevo ticket)

| Paso | Título | Contenido |
|---|---|---|
| 1 | Describe el problema | Título + descripción |
| 2 | Clasifícalo | Departamento (chips) + prioridad (`ChoiceCard` con descripción de urgencia) |
| 3 | Asígnalo | Responsable + URL de evidencia |
| 4 | Revisa y crea | `TicketReview`: resumen por secciones con "Editar" que salta al paso exacto |

- Header: "Nuevo ticket" + "Paso N de 4", `StepProgress` (un segmento por paso, se llena con gradiente) y título/subtítulo del paso.
- "Atrás" (desde el paso 2) y "Siguiente"/"Crear ticket" son **extensiones de la isla**, no botones dentro del contenido.
- "Siguiente" solo valida los campos del paso actual; los errores aparecen tras el primer intento en ese paso.
- La barra de estado se pone clara mientras la tab está enfocada (header negro).

---

## 6. Componentes

### Isla de navegación (`FloatingNav`, global)
- Vive en el layout raíz, por encima de todas las rutas (tabs y pantallas apiladas). Las tabs usan `tabBar={() => null}`.
- **Isla**: pill con 3 ítems circulares de 52; activo con anillo `brandGradient` que se desliza (250 ms, ease-in-out). En rutas que no son tab, el indicador se oculta.
  Fondo `ink2` sobre la zona negra del listado y gris translúcido sobre pantallas claras.
- **Extensiones** (se registran con `useNavActions` mientras la pantalla está enfocada):
  - **Atrás** (izquierda): círculo `ink` de 64. Aparece cuando la pantalla lo define (p. ej. pasos del formulario) o, automáticamente, en rutas apiladas (`router.back()`).
  - **Acción principal** (derecha): `GradientButton` con gradiente vivo, ocupa todo el ancho restante.
- Posición determinista: la isla se centra con sus extensiones y, si hay acción principal, se ancla a la izquierda. El desplazamiento se anima con un shared value (250 ms, ease-in-out); las extensiones entran con fade + deslizamiento desde la isla y salen igual.
- Se apoya más cerca del indicador de inicio (`navbar.homeIndicatorOverlap`). `useTabBarInset()` da el espacio que debe reservar el contenido.
- Haptic de selección al cambiar de tab o al pulsar atrás.

### Segmented control (filtro de estado / selector de prioridad)
- Contenedor pill `surface` (o `ink2` en la zona negra), opciones `label`.
- El pill activo `ink` **se desliza** entre opciones (250 ms, ease-in-out) y el texto activo es blanco.
- Opciones: `Todos · Abierto · En proceso · Resuelto`.

### Chip
- Pill de 36 de alto, fondo `ink3` (sobre negro) o `surface` (sobre canvas).
- Layout `scroll` (una fila deslizable, filtros) o `wrap` (varias filas, formularios). Puede no tener nada seleccionado.
- Variante filtro: dot de color + label; al seleccionarlo, el borde de 1.5 toma el color del dot (transición de 150 ms).
- Variante etiqueta (departamento): solo texto, sin interacción.

### Badge de estado
- Pill outline (`border`), ícono de 16 en el color del estado y label `caption`.
- Al cambiar de estado, el color hace crossfade en 200 ms.

### Card de ticket (`ItemCard`)
```
┌──────────────────────────────────┐
│ ● Alta              (✓ Abierto)  │  dot de prioridad + badge de estado
│ Impresora del 2do piso no ...    │  heading, máx. 2 líneas
│ Asignado a Carlos Méndez         │  caption secundario
│ ─────────────────────────────    │
│ [Recursos Humanos]    ◷ hace 2 h │  chip departamento + fecha relativa
└──────────────────────────────────┘
```
- Radio `lg`, padding 20 y `ink2` sobre la zona negra.
- Press: `scale 0.97` en 120 ms.
- Entrada: **nunca `entering` en filas del FlatList** (las filas se desmontan y vuelven a montar al hacer scroll, y la
  animación se repetiría). Se anima **el contenedor de la lista una sola vez** en la primera carga (fade + `translateY 8`).
  Al filtrar, los items se reacomodan con `itemLayoutAnimation` (`LinearTransition` de 200 ms).

### Botón primario (`GradientButton`)
- Pill de 56 de alto y ancho completo, con ícono + label en blanco.
- **Gradiente vivo**: una capa `LinearGradient` más ancha que el botón se traslada en bucle (`translateX`, 6 s, lineal,
  ida y vuelta) dentro de `overflow: hidden`. Es solo `transform`, así que el costo es casi nulo.
- Press: `scale 0.97` en 120 ms. Con `loading`, el label se cambia por un spinner blanco y el gradiente acelera (2 s).
- Con movimiento reducido, el gradiente queda estático en el tramo central (morado/magenta).

### Botón secundario / inverso / destructivo
- Secundario: pill `ink` con texto blanco (fondos claros).
- Inverso: pill `surface` con texto `ink` (zona negra; p. ej. "Reintentar" en el listado).
- Destructivo: pill outline `red` con texto `red`; siempre pasa por un `Alert` de confirmación.

### Botón circular (`IconButton`)
- 48×48, ícono de 22 con trazo de 1.75. Tonos: `light` (`surface`, sobre canvas), `muted` (`surfaceMuted`, sobre
  superficies blancas como el header del listado) y `dark` (`ink3`, sobre negro).

### Input (`CustomInput`)
- Pill de 56 (multilínea: radio `md`, mínimo 120 de alto) con fondo `surface`.
- Foco: borde de 1.5 con el color `purple` (150 ms).
- Error: borde `red` + texto `caption` en rojo que entra con fade + `translateY 4` y `Haptics.notificationAsync(Error)` al enviar.

### Fila de departamento (Ajustes)
- Dentro de una card `surface`: nombre en `body`, a la derecha `IconButton` pequeños (editar / eliminar en `red`), separados por divisores `border`.
- Renombrar es inline: la fila se convierte en input con foco; guardar o cancelar sin abrir otra pantalla.
- Alta: la fila nueva entra con `FadeIn` + `LinearTransition` de 200 ms; al borrar sale con `FadeOut` y las demás se reacomodan.
- Borrado bloqueado (en uso): `Alert` explicativo + `Haptics.notificationAsync(Warning)`; la fila no se mueve.

### Banner sin conexión
- Pill `ink3` sobre la zona negra, dot `amber` + "Sin conexión · mostrando datos guardados" en `caption`.
- Entra con fade + `translateY -8` en 200 ms y sale igual al recuperar la conexión. No bloquea la lista.

### StepProgress
- Fila de segmentos de 6 px (`ink3`); completados y actual se llenan con `brandGradient` mediante `scaleX` desde la izquierda (250 ms, ease-out).

### ChoiceCard
- Card `surface` radio `lg` con dot de color, título `heading`, descripción `caption` y check circular.
- Seleccionada: borde de 2 px del color de la opción (150 ms) y check con fade + escala 0.8 → 1. Haptic de selección.

### EvidenceImage
- `expo-image` con radio `md` sobre `surfaceMuted`. Si la URL falla, muestra ícono + "No se pudo cargar la evidencia".

### Estados (`StateMessage`, `LoadingSpinner`)
- Loading: `ActivityIndicator` (lo exige el PDF) en el color de texto de la zona.
- Vacío: logo TT a 64 px, título y subtítulo; entra con fade + `scale 0.95` (momento poco frecuente, se permite el deleite).
- Error de red: ícono en `red`, mensaje y botón secundario "Reintentar".

---

## 7. Logo provisional "TT"

- Dos letras **T** iguales y entrelazadas: la delantera desplazada `+16x, +6y`, separada de la trasera por un corte
  del color de fondo (prop `backgroundColor`).
- Relleno con **un solo** `brandGradient` continuo en el espacio del SVG (`gradientUnits="userSpaceOnUse"`).
- Usos: header de Tickets (32 px dentro de un círculo `ink` de 48), estado vacío (64 px) y splash/ícono de la app.
- El nombre "TicketTracker" va en `heading`, siempre en `textPrimary`; el gradiente se reserva para el monograma.

---

## 8. Catálogo de animaciones

| Elemento | Propósito | Técnica | Duración |
|---|---|---|---|
| Indicador del navbar | Consistencia espacial | Shared value + `withTiming` | 250 ms, ease-in-out |
| Extensiones de la isla | Consistencia espacial | Fade + deslizamiento desde la isla; la isla se reubica con shared value | 250 ms |
| Pill del segmented | Indicar estado | Igual que el navbar | 250 ms, ease-in-out |
| Press de cualquier pressable | Feedback | Shared value + `withTiming` en `scale` (`PressableScale`) | 120 ms, ease-out |
| Gradiente del CTA | Deleite / jerarquía | `translateX` en bucle | 6 s (2 s en loading) |
| Entrada de la lista | Evitar un cambio brusco | Contenedor con fade + `translateY`, solo la primera carga | 250 ms |
| Reacomodo al filtrar | Consistencia espacial | `itemLayoutAnimation` LinearTransition | 200 ms |
| Cambio de estado | Indicar estado | Crossfade de color + haptic de éxito | 200 ms |
| Eliminar ticket | Feedback | `exiting` FadeOut + haptic Medium | 200 ms |
| Error de input | Feedback | Fade + `translateY 4` | 150 ms |
| Cambio de paso | Consistencia espacial | `FadeInRight` al avanzar / `FadeInLeft` al retroceder | 250 ms |
| Progreso de pasos | Indicar estado | `scaleX` del segmento | 250 ms, ease-out |
| Selección de ChoiceCard | Feedback | Borde + check (fade/escala) | 150 ms |
| Estado vacío | Deleite | Fade + `scale 0.95 → 1` | 300 ms |
| Ir a Detalle | — | Push del stack nativo (sin tocar) | Plataforma |
| Cambiar de tab | — | **Sin animación de contenido** | — |

---

## 9. Fuera de alcance de la referencia

Se ignoran: avatares y fotos de personas, buscador, notificaciones, likes/comentarios/compartir y los banners con imagen.
Las fotos de la referencia se sustituyen por el **logo TT**, los **dots de color** y las **imágenes de evidencia** del ticket (en Detalle).

---

## 10. Dependencias de UI

`expo-sqlite` (DB local) · `react-native-reanimated` · `react-native-worklets` · `expo-linear-gradient` · `expo-haptics` · `react-native-svg` ·
`lucide-react-native` (íconos outline, trazo de 1.75) · `@expo-google-fonts/plus-jakarta-sans` · `expo-font`.
Todas se instalan con `npx expo install`.
