import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

/** Bezpiecznie formatuje datę do 'dd.MM.yyyy' (locale PL). Zwraca '-' dla pustych. */
export function formatData(date) {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return format(d, 'dd.MM.yyyy', { locale: pl });
}

/** Format z godziną: 'dd.MM.yyyy HH:mm'. */
export function formatDataTime(date) {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return format(d, 'dd.MM.yyyy HH:mm', { locale: pl });
}

/** Format dla inputów typu date: 'yyyy-MM-dd'. */
export function formatDataISO(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd');
}
