export type Locale = 'sv' | 'en';

/**
 * A message lookup as the pure `src/lib` helpers see it: `useTranslations(ns)` / `getTranslations(ns)`
 * satisfy it, and node tests pass a stub. Keys are checked by the message-parity test and by the
 * helpers' own tests against the real messages.
 */
export type Translator = ((key: any, values?: any) => string) & { has?: (key: any) => boolean };

/**
 * BCP 47 tag for `Intl`. English uses en-GB, not en-US: 24-hour clock and day-before-month,
 * which is what people in Göteborg expect to read.
 */
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-GB' : 'sv-SE';
}
