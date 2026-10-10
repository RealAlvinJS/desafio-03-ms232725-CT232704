// La URL viene de EXPO_PUBLIC_API_URL (.env); Ajustes permite cambiarla en tiempo de ejecución.
// Sin .env se usa el placeholder y el listado mostrará el error de red controlado.
export const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://XXXXXXXX.mockapi.io';

export const REQUEST_TIMEOUT_MS = 10000;

export const TICKETS_ENDPOINT = '/tickets';

export const DATABASE_NAME = 'tickettracker.db';
