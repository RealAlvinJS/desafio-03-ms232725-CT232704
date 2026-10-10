import axios, { isAxiosError } from 'axios';

import { DEFAULT_BASE_URL, REQUEST_TIMEOUT_MS } from '@/constants/config';

export const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getBaseUrl(): string {
  return api.defaults.baseURL ?? DEFAULT_BASE_URL;
}

// Sin barra final para que '/tickets' no genere rutas con doble barra.
export function setBaseUrl(url: string): void {
  api.defaults.baseURL = url.trim().replace(/\/+$/, '');
}

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return 'Ocurrió un error inesperado.';
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.';
  }

  const status = error.response?.status;

  if (status === undefined) {
    return 'No hay conexión con el servidor. Revisa tu internet o la URL en Ajustes.';
  }
  if (status === 404) {
    return 'El recurso no existe o fue eliminado.';
  }
  if (status >= 500) {
    return 'El servidor tuvo un problema. Intenta de nuevo en unos segundos.';
  }

  return `La solicitud falló (código ${status}).`;
}
