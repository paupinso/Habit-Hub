/**
 * Catalan Date Formatting & Week Math Utilities
 */

export const CATALAN_DAYS_FULL = [
  'Diumenge',
  'Dilluns',
  'Dimarts',
  'Dimecres',
  'Dijous',
  'Divendres',
  'Dissabte',
];

export const CATALAN_DAYS_SHORT = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];

export const CATALAN_MONTHS = [
  'gener',
  'febrer',
  'març',
  'abril',
  'maig',
  'juny',
  'juliol',
  'agost',
  'setembre',
  'octubre',
  'novembre',
  'desembre',
];

export function formatDateIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // Noon to prevent timezone shift
}

export function getTodayIso(): string {
  return formatDateIso(new Date());
}

export function formatCatalanDateLong(iso: string): string {
  const d = parseIsoDate(iso);
  const dayName = CATALAN_DAYS_FULL[d.getDay()];
  const dayNumber = d.getDate();
  const monthName = CATALAN_MONTHS[d.getMonth()];
  const prefix = monthName.startsWith('a') || monthName.startsWith('o') ? "d'" : 'de ';
  return `${dayName}, ${dayNumber} ${prefix}${monthName}`;
}

export function formatCatalanDateShort(iso: string): string {
  const d = parseIsoDate(iso);
  const dayName = CATALAN_DAYS_FULL[d.getDay()];
  const dayNumber = d.getDate();
  return `${dayName} ${dayNumber}`;
}

/**
 * Returns the Monday-Sunday week array containing the target date
 */
export function getWeekDaysForDate(targetIso: string) {
  const target = parseIsoDate(targetIso);
  const dayOfWeek = target.getDay(); // 0 is Sunday, 1 is Monday ...
  // In Europe/Catalonia, week starts on Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(target);
  monday.setDate(target.getDate() + diffToMonday);

  const todayIso = getTodayIso();
  const days: { date: string; dayName: string; dayNumber: number; isToday: boolean; isPast: boolean }[] = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const iso = formatDateIso(cur);
    const dayIdx = cur.getDay();

    days.push({
      date: iso,
      dayName: CATALAN_DAYS_SHORT[dayIdx],
      dayNumber: cur.getDate(),
      isToday: iso === todayIso,
      isPast: iso <= todayIso,
    });
  }

  return days;
}

/**
 * Get human readable week label, e.g. "12 - 18 d'octubre"
 */
export function getWeekRangeLabel(weekDays: { date: string }[]): string {
  if (weekDays.length < 7) return '';
  const first = parseIsoDate(weekDays[0].date);
  const last = parseIsoDate(weekDays[6].date);

  const firstMonth = CATALAN_MONTHS[first.getMonth()];
  const lastMonth = CATALAN_MONTHS[last.getMonth()];

  if (first.getMonth() === last.getMonth()) {
    const prefix = lastMonth.startsWith('a') || lastMonth.startsWith('o') ? "d'" : 'de ';
    return `${first.getDate()} - ${last.getDate()} ${prefix}${lastMonth}`;
  }

  return `${first.getDate()} de ${firstMonth} - ${last.getDate()} de ${lastMonth}`;
}
