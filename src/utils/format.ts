const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Se crea una sola vez: instanciar Intl en cada render es costoso dentro de una lista.
const shortDateFormatter = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' });
const longDateFormatter = new Intl.DateTimeFormat('es-SV', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

// Lo reciente se lee mejor en relativo; pasada una semana se muestra la fecha corta.
export function formatRelativeDate(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) {
    return 'Sin fecha';
  }

  const date = new Date(iso);
  const elapsed = now.getTime() - date.getTime();

  if (Number.isNaN(elapsed)) {
    return 'Sin fecha';
  }
  if (elapsed < MINUTE) {
    return 'hace un momento';
  }
  if (elapsed < HOUR) {
    return `hace ${Math.floor(elapsed / MINUTE)} min`;
  }
  if (elapsed < DAY) {
    return `hace ${Math.floor(elapsed / HOUR)} h`;
  }
  if (elapsed < 2 * DAY) {
    return 'ayer';
  }
  if (elapsed < 7 * DAY) {
    return `hace ${Math.floor(elapsed / DAY)} días`;
  }

  return shortDateFormatter.format(date);
}

export function formatFullDate(iso: string | undefined): string {
  if (!iso) {
    return 'Sin fecha';
  }

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : longDateFormatter.format(date);
}
