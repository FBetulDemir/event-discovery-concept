import { useLocale, useTranslations } from 'next-intl';
import { formatBudget } from '@/data/match-options';
import { formatDateSelection } from '@/lib/dates';
import { cityLabel, moodLabel } from '@/lib/i18n/labels';
import type { Preferences } from '@/types/preferences';

/** What you picked, in four plain facts. */
export function MatchSummary({ preferences }: { preferences: Preferences }) {
  const t = useTranslations('match.summary');
  const all = useTranslations();
  const locale = useLocale();
  const items = [
    { label: t('when'), value: formatDateSelection(preferences.date, locale, all) },
    { label: t('where'), value: t('within', { city: cityLabel(all, preferences.location), distance: preferences.distance }) },
    { label: t('mood'), value: preferences.moods.map(mood => moodLabel(all, mood)).join(', ') || t('open') },
    { label: t('budget'), value: formatBudget(preferences.budget, all) },
  ];
  return <dl className="match-summary">{items.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
