import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import {
  deleteCachedTicket,
  readCachedTickets,
  replaceCachedTickets,
  upsertCachedTicket,
} from '@/db/ticketCacheRepository';
import { getBaseUrl, getErrorMessage } from '@/services/api';
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  updateItem,
} from '@/services/resourceService';
import type { Ticket, TicketInput, TicketUpdate } from '@/types/Entity';

type LoadStatus = 'loading' | 'ready' | 'error';

interface TicketsState {
  tickets: Ticket[];
  status: LoadStatus;
  error: string | null;
  isOffline: boolean;
  isRefreshing: boolean;
}

type TicketsAction =
  | { type: 'cache_loaded'; tickets: Ticket[] }
  | { type: 'fetch_started'; refreshing: boolean }
  | { type: 'fetch_succeeded'; tickets: Ticket[] }
  | { type: 'fetch_failed'; error: string }
  | { type: 'ticket_saved'; ticket: Ticket }
  | { type: 'ticket_removed'; id: string };

interface TicketsContextValue extends TicketsState {
  fetchTickets: (options?: { refreshing?: boolean }) => Promise<void>;
  fetchTicket: (id: string) => Promise<Ticket>;
  addTicket: (input: TicketInput) => Promise<Ticket>;
  editTicket: (id: string, changes: TicketUpdate) => Promise<Ticket>;
  removeTicket: (id: string) => Promise<void>;
}

const initialState: TicketsState = {
  tickets: [],
  status: 'loading',
  error: null,
  isOffline: false,
  isRefreshing: false,
};

function ticketsReducer(state: TicketsState, action: TicketsAction): TicketsState {
  switch (action.type) {
    case 'cache_loaded':
      return action.tickets.length > 0
        ? { ...state, tickets: action.tickets, status: 'ready' }
        : state;
    case 'fetch_started':
      return { ...state, isRefreshing: action.refreshing, error: null };
    case 'fetch_succeeded':
      return {
        ...state,
        tickets: action.tickets,
        status: 'ready',
        isOffline: false,
        isRefreshing: false,
      };
    case 'fetch_failed':
      // Con datos guardados se sigue mostrando la lista en modo sin conexión; sin ellos, es un error.
      return state.tickets.length > 0
        ? { ...state, isOffline: true, isRefreshing: false }
        : { ...state, status: 'error', error: action.error, isRefreshing: false };
    case 'ticket_saved': {
      const exists = state.tickets.some((ticket) => ticket.id === action.ticket.id);
      const tickets = exists
        ? state.tickets.map((ticket) => (ticket.id === action.ticket.id ? action.ticket : ticket))
        : [action.ticket, ...state.tickets];
      // Una escritura exitosa demuestra que hay conexión.
      return { ...state, tickets, status: 'ready', isOffline: false };
    }
    case 'ticket_removed':
      return {
        ...state,
        tickets: state.tickets.filter((ticket) => ticket.id !== action.id),
        isOffline: false,
      };
  }
}

// Las pantallas reciben errores ya traducidos; nunca ven detalles de Axios.
function toFriendlyError(error: unknown): Error {
  return new Error(getErrorMessage(error));
}

// La caché es auxiliar: si SQLite falla, la app sigue con los datos del servidor.
function reportCacheError(error: unknown): void {
  console.warn('No se pudo actualizar la caché local de tickets.', error);
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [state, dispatch] = useReducer(ticketsReducer, initialState);

  const fetchTickets = useCallback(
    async ({ refreshing = false }: { refreshing?: boolean } = {}) => {
      dispatch({ type: 'fetch_started', refreshing });
      let tickets: Ticket[];
      try {
        tickets = await getItems();
      } catch (error) {
        dispatch({ type: 'fetch_failed', error: getErrorMessage(error) });
        return;
      }
      dispatch({ type: 'fetch_succeeded', tickets });
      replaceCachedTickets(db, getBaseUrl(), tickets).catch(reportCacheError);
    },
    [db],
  );

  // Cache-first: se pinta la copia local al instante y el servidor la reemplaza al responder.
  useEffect(() => {
    let isActive = true;

    readCachedTickets(db, getBaseUrl())
      .then((cached) => {
        if (isActive) {
          dispatch({ type: 'cache_loaded', tickets: cached });
        }
      })
      .catch(reportCacheError)
      .finally(() => {
        if (isActive) {
          fetchTickets();
        }
      });

    return () => {
      isActive = false;
    };
  }, [db, fetchTickets]);

  // El detalle siempre consulta el servidor; la respuesta también refresca listado y caché.
  const fetchTicket = useCallback(
    async (id: string) => {
      let ticket: Ticket;
      try {
        ticket = await getItemById(id);
      } catch (error) {
        throw toFriendlyError(error);
      }
      dispatch({ type: 'ticket_saved', ticket });
      upsertCachedTicket(db, getBaseUrl(), ticket).catch(reportCacheError);
      return ticket;
    },
    [db],
  );

  const addTicket = useCallback(
    async (input: TicketInput) => {
      let ticket: Ticket;
      try {
        ticket = await createItem(input);
      } catch (error) {
        throw toFriendlyError(error);
      }
      dispatch({ type: 'ticket_saved', ticket });
      upsertCachedTicket(db, getBaseUrl(), ticket).catch(reportCacheError);
      return ticket;
    },
    [db],
  );

  const editTicket = useCallback(
    async (id: string, changes: TicketUpdate) => {
      let ticket: Ticket;
      try {
        ticket = await updateItem(id, changes);
      } catch (error) {
        throw toFriendlyError(error);
      }
      dispatch({ type: 'ticket_saved', ticket });
      upsertCachedTicket(db, getBaseUrl(), ticket).catch(reportCacheError);
      return ticket;
    },
    [db],
  );

  const removeTicket = useCallback(
    async (id: string) => {
      try {
        await deleteItem(id);
      } catch (error) {
        throw toFriendlyError(error);
      }
      dispatch({ type: 'ticket_removed', id });
      deleteCachedTicket(db, id).catch(reportCacheError);
    },
    [db],
  );

  const value = useMemo(
    () => ({ ...state, fetchTickets, fetchTicket, addTicket, editTicket, removeTicket }),
    [state, fetchTickets, fetchTicket, addTicket, editTicket, removeTicket],
  );

  return <TicketsContext value={value}>{children}</TicketsContext>;
}

export function useTickets(): TicketsContextValue {
  const context = use(TicketsContext);
  if (!context) {
    throw new Error('useTickets debe usarse dentro de TicketsProvider');
  }
  return context;
}
