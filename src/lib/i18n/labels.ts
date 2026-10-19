import type { EventCategory } from '@/types/event';
import type { Mood } from '@/types/preferences';
import type { Translator } from './locale.ts';

/**
 * Categories and moods are data identifiers (they drive filtering, matching and stored plan
 * snapshots), so their values stay Swedish in every language. These give them a display name.
 * `t` is the root translator (`useTranslations()`).
 */
export const categoryLabel = (t: Translator, category: EventCategory): string => t(`categories.${category}`);
export const moodLabel = (t: Translator, mood: Mood): string => t(`moods.${mood}`);

/** City names are data too (`Göteborg` matches Preferences.location); English shows the exonym. */
export const cityLabel = (t: Translator, city: string): string => {
  const key = `cities.${city}`;
  return t.has?.(key) ? t(key) : city;
};
