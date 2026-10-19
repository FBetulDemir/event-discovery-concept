import type { Preferences } from '@/types/preferences';
import type { Translator } from '@/lib/i18n/locale';

export const defaultPreferences: Preferences = {
  location: 'Göteborg',
  date: { mode: 'flexible' },
  distance: 5,
  moods: [],
  budget: null,
};

export function formatBudget(budget: number | null, t: Translator): string {
  if (budget === null) return t('format.noBudgetLimit');
  return budget === 0 ? t('format.free') : t('format.upTo', { budget });
}
