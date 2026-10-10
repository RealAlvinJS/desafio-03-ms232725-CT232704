import type { TicketPriority } from '@/types/Entity';

export interface TicketForm {
  title: string;
  category: string;
  priority: TicketPriority | null;
  description: string;
  assignee: string;
  imageUrl: string;
}

export type TicketFormErrors = Partial<Record<keyof TicketForm, string>>;

export const TICKET_LIMITS = {
  titleMin: 5,
  titleMax: 80,
  descriptionMin: 10,
  descriptionMax: 500,
  assigneeMin: 3,
  assigneeMax: 60,
} as const;

export const DEPARTMENT_LIMITS = {
  nameMin: 2,
  nameMax: 40,
} as const;

export const EMPTY_TICKET_FORM: TicketForm = {
  title: '',
  category: '',
  priority: null,
  description: '',
  assignee: '',
  imageUrl: '',
};

type Gender = 'masculine' | 'feminine';

function lengthError(
  value: string,
  min: number,
  max: number,
  field: string,
  gender: Gender = 'masculine',
): string | undefined {
  const length = value.trim().length;
  if (length === 0) {
    return `${field} es ${gender === 'feminine' ? 'obligatoria' : 'obligatorio'}.`;
  }
  if (length < min) {
    return `${field} debe tener al menos ${min} caracteres.`;
  }
  if (length > max) {
    return `${field} no puede superar ${max} caracteres.`;
  }
  return undefined;
}

// Regex en lugar de `URL`: la implementación de React Native no expone todos sus getters.
const HTTPS_URL_PATTERN = /^https:\/\/[^\s/?#]+\.[^\s/?#]+(?:[/?#]\S*)?$/i;

// La evidencia es opcional, pero si se envía debe ser HTTPS para que la imagen cargue en iOS y Android.
export function isValidHttpsUrl(value: string): boolean {
  return HTTPS_URL_PATTERN.test(value.trim());
}

export function validateTicket(form: TicketForm): TicketFormErrors {
  const errors: TicketFormErrors = {
    title: lengthError(form.title, TICKET_LIMITS.titleMin, TICKET_LIMITS.titleMax, 'El título'),
    description: lengthError(
      form.description,
      TICKET_LIMITS.descriptionMin,
      TICKET_LIMITS.descriptionMax,
      'La descripción',
      'feminine',
    ),
    assignee: lengthError(
      form.assignee,
      TICKET_LIMITS.assigneeMin,
      TICKET_LIMITS.assigneeMax,
      'El responsable',
    ),
    category: form.category ? undefined : 'Selecciona un departamento.',
    priority: form.priority ? undefined : 'Selecciona una prioridad.',
    imageUrl:
      form.imageUrl.trim() && !isValidHttpsUrl(form.imageUrl)
        ? 'Ingresa una URL válida que empiece con https://'
        : undefined,
  };

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as TicketFormErrors;
}

export function hasErrors(errors: TicketFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function validateDepartmentName(name: string): string | undefined {
  return lengthError(name, DEPARTMENT_LIMITS.nameMin, DEPARTMENT_LIMITS.nameMax, 'El nombre');
}

// En formularios por pasos solo se muestran los errores de los campos del paso que se intentó avanzar.
export function pickErrors(
  errors: TicketFormErrors,
  fields: readonly (keyof TicketForm)[],
): TicketFormErrors {
  return Object.fromEntries(
    fields.filter((field) => errors[field]).map((field) => [field, errors[field]]),
  ) as TicketFormErrors;
}

export function validateAssignee(name: string): string | undefined {
  return lengthError(name, TICKET_LIMITS.assigneeMin, TICKET_LIMITS.assigneeMax, 'El responsable');
}
