# TicketTracker

App Helpdesk en Expo + expo-router + TypeScript estricto + Axios + MockAPI (Desafío Práctico 3, UDB).

- Alcance, arquitectura y reglas de negocio: [PLANNING.md](PLANNING.md)
- Diseño, tokens y animaciones: [DESIGN.md](DESIGN.md) — leerlo antes de tocar cualquier UI.
- Avance, decisiones y pendientes: [CHANGELOG.md](CHANGELOG.md) — leerlo al iniciar sesión para saber dónde quedamos.

## Reglas
- Comentarios con `//`, máximo 2 líneas, solo para lógica de negocio.
- Identificadores en inglés, textos de UI en español.
- Sin colores, radios ni duraciones hardcodeados: todo sale de `src/constants/theme.ts`.
- Las pantallas no importan Axios ni SQLite; usan los contextos (`TicketsContext`, `DepartmentsContext`).
- Tickets: MockAPI es la fuente de verdad, SQLite solo caché. Departamentos: solo SQLite.
- Listado con FlatList (requisito del PDF). Animación: manda `animate-expo`; cada animación necesita un propósito.
- Dependencias nativas con `npx expo install`. Comandos y reglas de Expo SDK 57: [AGENTS.md](AGENTS.md).
- Antes de dar algo por terminado: `npm run check`.
- Al cerrar cada hito: actualizar CHANGELOG.md (Agregado / Decisiones / Problemas / Pendiente) en el mismo commit. No registrar cambios pequeños.
