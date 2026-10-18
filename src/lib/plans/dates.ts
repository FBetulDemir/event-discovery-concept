/** "fredag 23 oktober" for a plan or event day (YYYY-MM-DD, formatted as UTC). Null stays null. */
export function formatPlanDate(date: string | null, short = false): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat('sv-SE', short
    ? { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }
    : { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`)).replaceAll('.', '');
}
