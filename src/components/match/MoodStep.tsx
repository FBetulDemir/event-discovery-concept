import { useTranslations } from 'next-intl';
import { AudioLines, Music2, Smile, Wine } from 'lucide-react';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { moodLabel } from '@/lib/i18n/labels';
import type { Mood } from '@/types/preferences';

const moods = [
  { value: 'Dansa', icon: AudioLines },
  { value: 'Livemusik', icon: Music2 },
  { value: 'Skratta', icon: Smile },
  { value: 'Hänga', icon: Wine },
] as const;

export function MoodStep({ selected, onChange }: { selected: Mood[]; onChange: (moods: Mood[]) => void }) {
  const t = useTranslations('match.mood');
  const all = useTranslations();
  return (
    <fieldset className="flow-fields">
      <legend>{t('legend')}</legend>
      <div className="selection-grid selection-grid--moods">
        {moods.map(mood => <SelectionCard key={mood.value} type="checkbox" name="moods" value={mood.value} title={moodLabel(all, mood.value)} description={t(mood.value)} icon={mood.icon} checked={selected.includes(mood.value)} onChange={() => onChange(selected.includes(mood.value) ? selected.filter(value => value !== mood.value) : [...selected, mood.value])} />)}
      </div>
      <p className="field-help">{t('help')}</p>
    </fieldset>
  );
}
