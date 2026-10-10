import { TICKETS_ENDPOINT } from '@/constants/config';
import { INITIAL_STATUS } from '@/constants/tickets';
import type { Ticket, TicketInput, TicketUpdate } from '@/types/Entity';

import { api, normalizeBaseUrl } from './api';

type RawTicket = Omit<Ticket, 'createdAt' | 'imageUrl'> & {
  createdAt?: string | number;
  imageUrl?: string;
};

// MockAPI rellena con un timestamp en segundos o un texto genérico los campos que faltan.
// Se normalizan aquí para que la app solo vea fechas ISO y URLs reales o ausentes.
function toTicket(raw: RawTicket): Ticket {
  const { createdAt, imageUrl, ...rest } = raw;

  return {
    ...rest,
    createdAt: typeof createdAt === 'number' ? new Date(createdAt * 1000).toISOString() : createdAt,
    imageUrl: imageUrl?.startsWith('https://') ? imageUrl : undefined,
  };
}

export async function getItems(): Promise<Ticket[]> {
  const { data } = await api.get<RawTicket[]>(TICKETS_ENDPOINT);
  return data.map(toTicket);
}

export async function getItemById(id: string): Promise<Ticket> {
  const { data } = await api.get<RawTicket>(`${TICKETS_ENDPOINT}/${id}`);
  return toTicket(data);
}

export async function createItem(input: TicketInput): Promise<Ticket> {
  // Todo ticket nace Abierto; fecha e imagen se envían siempre para evitar los rellenos de MockAPI.
  const payload = {
    ...input,
    status: INITIAL_STATUS,
    imageUrl: input.imageUrl ?? '',
    createdAt: new Date().toISOString(),
  };

  const { data } = await api.post<RawTicket>(TICKETS_ENDPOINT, payload);
  return toTicket(data);
}

export async function updateItem(id: string, changes: TicketUpdate): Promise<Ticket> {
  const { data } = await api.patch<RawTicket>(`${TICKETS_ENDPOINT}/${id}`, changes);
  return toTicket(data);
}

export async function deleteItem(id: string): Promise<void> {
  await api.delete(`${TICKETS_ENDPOINT}/${id}`);
}

// Prueba una URL sin cambiar la configuración activa; devuelve cuántos tickets expone.
export async function pingTickets(baseUrl: string): Promise<number> {
  const { data } = await api.get<unknown[]>(TICKETS_ENDPOINT, {
    baseURL: normalizeBaseUrl(baseUrl),
  });
  return Array.isArray(data) ? data.length : 0;
}
