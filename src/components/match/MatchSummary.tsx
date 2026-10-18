import { formatBudget } from '@/data/match-options';
import { formatDateSelection } from '@/lib/dates';
import type { Preferences } from '@/types/preferences';

/** What you picked, in four plain facts. */
export function MatchSummary({ preferences }: { preferences: Preferences }) {
  const items = [
    { label: 'När', value: formatDateSelection(preferences.date) },
    { label: 'Var', value: `${preferences.location}, inom ${preferences.distance} km` },
    { label: 'Känsla', value: preferences.moods.join(', ') || 'Öppen för allt' },
    { label: 'Budget', value: formatBudget(preferences.budget) },
  ];
  return <dl className="match-summary">{items.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
