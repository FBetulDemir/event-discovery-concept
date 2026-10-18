import { defineRouting } from 'next-intl/routing';

/**
 * Swedish is the default and has no prefix (`/plan`); English lives under `/en` (D-011, D-022).
 * `localeDetection` is on only so the NEXT_LOCALE cookie (set by the toggle) is honoured on
 * unprefixed URLs; src/proxy.ts strips Accept-Language so the browser's language never decides.
 */
export const routing = defineRouting({
  locales: ['sv', 'en'],
  defaultLocale: 'sv',
  localePrefix: 'as-needed',
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
