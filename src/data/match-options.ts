import type { Preferences } from '@/types/preferences';

export const defaultPreferences: Preferences = {
  location: 'Göteborg',
  date: { mode: 'flexible' },
  distance: 5,
  moods: [],
  budget: null,
};

export function formatBudget(budget: number | null): string {
  if (budget === null) return 'Ingen prisgräns';
  return budget === 0 ? 'Fri entré' : `Upp till ${budget} kr`;
}
