import { PRIORITY_WEIGHT } from '@/constants/tickets';
import type { Ticket, TicketPriority, TicketStatus } from '@/types/Entity';

export type StatusFilter = TicketStatus | 'all';
export type PriorityFilter = TicketPriority | 'all';

export interface TicketFilters {
  status: StatusFilter;
  priority: PriorityFilter;
}

export const NO_FILTERS: TicketFilters = { status: 'all', priority: 'all' };

function timestamp(ticket: Ticket): number {
  const time = ticket.createdAt ? new Date(ticket.createdAt).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

// El listado se clasifica por prioridad (Alta → Baja) y, dentro de cada una, del más reciente al más antiguo.
export function sortTickets(tickets: readonly Ticket[]): Ticket[] {
  return [...tickets].sort(
    (a, b) =>
      PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || timestamp(b) - timestamp(a),
  );
}

export function filterTickets(tickets: readonly Ticket[], filters: TicketFilters): Ticket[] {
  return tickets.filter(
    (ticket) =>
      (filters.status === 'all' || ticket.status === filters.status) &&
      (filters.priority === 'all' || ticket.priority === filters.priority),
  );
}

export function countBy<K extends keyof Ticket>(
  tickets: readonly Ticket[],
  key: K,
  value: Ticket[K],
): number {
  return tickets.reduce((total, ticket) => (ticket[key] === value ? total + 1 : total), 0);
}
