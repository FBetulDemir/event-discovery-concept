import type { routing } from '@/i18n/routing';
import type messages from './messages/sv.json';

// Typed message keys: a key missing from messages/sv.json fails `npm run typecheck`.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
