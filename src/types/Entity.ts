export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketPriority = 'high' | 'medium' | 'low';

// Contrato base que pide el desafío; Ticket lo especializa sin romperlo.
export interface EntityItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
}

// `category` guarda el nombre del departamento tal como era al crear el ticket.
export interface Ticket extends EntityItem {
  status: TicketStatus;
  priority: TicketPriority;
  description: string;
  assignee: string;
}

export type TicketInput = Omit<Ticket, 'id' | 'createdAt'>;

export type TicketUpdate = Partial<Pick<Ticket, 'status' | 'assignee'>>;

export interface Department {
  id: number;
  name: string;
  createdAt: string;
}
