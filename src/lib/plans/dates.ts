import { intlLocale, type Locale } from '../i18n/locale.ts';

/** "fredag 23 oktober" / "Friday 23 October" for a plan or event day (YYYY-MM-DD, formatted as UTC). Null stays null. */
export function formatPlanDate(date: string | null, locale: Locale, short = false): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat(intlLocale(locale), short
    ? { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }
    : { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`)).replaceAll('.', '');
}
