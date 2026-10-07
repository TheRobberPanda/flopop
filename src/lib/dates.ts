import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export type ISODate = string;

export function toISO(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

export function fromISO(date: ISODate): Date {
  return parseISO(date);
}

export function today(): ISODate {
  return toISO(new Date());
}

export function nowStamp(): string {
  return new Date().toISOString();
}

export function addDaysISO(date: ISODate, amount: number): ISODate {
  return toISO(addDays(fromISO(date), amount));
}

export function addMonthsISO(date: ISODate, amount: number): ISODate {
  return toISO(addMonths(fromISO(date), amount));
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(fromISO(to), fromISO(from));
}

export function isBefore(a: ISODate, b: ISODate): boolean {
  return a < b;
}

export function isAfter(a: ISODate, b: ISODate): boolean {
  return a > b;
}

export function isWithin(date: ISODate, start: ISODate, end: ISODate): boolean {
  return date >= start && date <= end;
}

export function clampISO(date: ISODate, min: ISODate, max: ISODate): ISODate {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

export function differenceInDays(a: ISODate, b: ISODate): number {
  return daysBetween(a, b);
}

export function rangeBetween(start: ISODate, end: ISODate): ISODate[] {
  if (start > end) return [];
  return eachDayOfInterval({ start: fromISO(start), end: fromISO(end) }).map(toISO);
}

export function monthGrid(anchor: ISODate): ISODate[] {
  const base = fromISO(anchor);
  const start = startOfWeek(startOfMonth(base), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(base), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(toISO);
}

export function formatShort(date: ISODate): string {
  return format(fromISO(date), 'EEE, d MMM');
}

export function formatMedium(date: ISODate): string {
  return format(fromISO(date), 'd MMM yyyy');
}

export function formatDayMonth(date: ISODate): string {
  return format(fromISO(date), 'd MMM');
}

export function formatMonthYear(date: ISODate): string {
  return format(fromISO(date), 'MMMM yyyy');
}

export function formatTime(date: ISODate): string {
  return format(fromISO(date), 'HH:mm');
}

export function dayOfWeek(date: ISODate): number {
  return getDay(fromISO(date));
}

export function isSameDate(a: ISODate, b: ISODate): boolean {
  return isSameDay(fromISO(a), fromISO(b));
}

export function isSameMonthISO(a: ISODate, b: ISODate): boolean {
  return isSameMonth(fromISO(a), fromISO(b));
}

export function monthKey(date: ISODate): string {
  return date.slice(0, 7);
}

export function relativeDayLabel(date: ISODate, reference: ISODate = today()): string {
  const diff = daysBetween(reference, date);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < -1 && diff > -7) return `${Math.abs(diff)} days ago`;
  return formatMedium(date);
}

export function humanDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
