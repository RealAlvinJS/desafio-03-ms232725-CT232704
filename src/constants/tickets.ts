import type { TicketPriority, TicketStatus } from '@/types/Entity';

import { colors } from './theme';

interface OptionMeta {
  label: string;
  color: string;
}

export const STATUSES: readonly TicketStatus[] = ['open', 'in_progress', 'resolved'];

export const PRIORITIES: readonly TicketPriority[] = ['high', 'medium', 'low'];

export const STATUS_META: Record<TicketStatus, OptionMeta> = {
  open: { label: 'Abierto', color: colors.purple },
  in_progress: { label: 'En proceso', color: colors.magenta },
  resolved: { label: 'Resuelto', color: colors.green },
};

export const PRIORITY_META: Record<TicketPriority, OptionMeta> = {
  high: { label: 'Alta', color: colors.red },
  medium: { label: 'Media', color: colors.amber },
  low: { label: 'Baja', color: colors.blue },
};

// El listado se clasifica por prioridad: menor peso aparece primero.
export const PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

// Todo ticket nace Abierto; el usuario no elige el estado inicial.
export const INITIAL_STATUS: TicketStatus = 'open';

// Solo se usan para poblar SQLite en el primer arranque; después son editables.
export const DEFAULT_DEPARTMENTS: readonly string[] = [
  'TI',
  'Recursos Humanos',
  'Finanzas',
  'Operaciones',
  'Ventas',
  'Administración',
];
