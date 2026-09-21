import type { Preferences } from '@/types/preferences';

// Fixed sample dates align with the fictional event catalogue, not today's date.
export const dateOptions = [
  { value: '2026-09-25', title: 'Fredag', description: '25 september 2026' },
  { value: '2026-09-26', title: 'Lördag', description: '26 september 2026' },
];

export const defaultPreferences: Preferences = {
  location: 'Göteborg',
  date: dateOptions[0].value,
  distance: 5,
  moods: [],
  budget: null,
};

export function formatBudget(budget: number | null): string {
  if (budget === null) return 'Ingen prisgräns';
  return budget === 0 ? 'Fri entré' : `Upp till ${budget} kr`;
}
