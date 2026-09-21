import { CalendarDays, MapPin, AudioLines, Wallet } from 'lucide-react';
import { formatBudget } from '@/data/match-options';
import { formatDateSelection } from '@/lib/dates';
import type { Preferences } from '@/types/preferences';

export function MatchSummary({ preferences }: { preferences: Preferences }) {
  const items = [
    { label: 'När', value: formatDateSelection(preferences.date), icon: CalendarDays },
    { label: 'Var', value: `${preferences.location} · inom ${preferences.distance} km`, icon: MapPin },
    { label: 'Känsla', value: preferences.moods.join(', ') || 'Öppen för allt', icon: AudioLines },
    { label: 'Budget', value: formatBudget(preferences.budget), icon: Wallet },
  ];

  return <dl className="match-summary">{items.map(({ label, value, icon: Icon }) => <div key={label}><dt><Icon size={16} aria-hidden="true" />{label}</dt><dd>{value}</dd></div>)}</dl>;
}
