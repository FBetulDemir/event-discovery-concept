import { intlLocale, type Locale, type Translator } from './i18n/locale.ts';

/** Kilometres as people read them: `1,8` in Swedish, `1.8` in English. */
export function formatKm(km: number, locale: Locale): string {
  return km.toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 });
}

/** Entry price as shown to people. `null` means the source does not publish one. `t` is the root translator. */
export function formatPrice(price: number | null, t: Translator): string {
  if (price === null) return t('format.priceUnknown');
  return price === 0 ? t('format.free') : t('format.price', { price });
}

/** Per-person wording used on detail screens. */
export function formatPricePerPerson(price: number | null, t: Translator): string {
  return price !== null && price > 0 ? t('format.pricePerPerson', { price }) : formatPrice(price, t);
}

export function formatAge(age: number | null, t: Translator): string | null {
  return age === null ? null : t('format.age', { age });
}

/**
 * "Tonight", "Tomorrow", a weekday within the coming week, otherwise a short date ("31 Dec").
 * A bare weekday for something months away reads as "this Thursday", which is wrong.
 */
export function formatWhen(date: string, today: string, locale: Locale, t: Translator): string {
  if (date === today) return t('format.tonight');
  const days = Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
  if (days === 1) return t('format.tomorrow');
  const at = new Date(`${date}T12:00:00Z`);
  const tag = intlLocale(locale);
  if (days > 1 && days <= 6) return new Intl.DateTimeFormat(tag, { weekday: 'long', timeZone: 'UTC' }).format(at);
  return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(at).replaceAll('.', '');
}
