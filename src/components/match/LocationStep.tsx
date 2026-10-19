import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/DatePicker';
import { Field } from '@/components/ui/Field';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { cityLabel } from '@/lib/i18n/labels';
import type { Preferences } from '@/types/preferences';

type Props = { preferences: Preferences; onChange: (patch: Partial<Preferences>) => void };

export function LocationStep({ preferences, onChange }: Props) {
  const t = useTranslations('match.location');
  const all = useTranslations();
  return (
    <div className="flow-fields">
      <fieldset>
        <legend>{t('whenLegend')}</legend>
        <DatePicker value={preferences.date} onChange={date => onChange({ date })} />
        <p className="field-help">{t('whenHelp')}</p>
      </fieldset>
      <Field label={t('whereLabel')} value={cityLabel(all, preferences.location)} readOnly hint={t('whereHint')} />
      <fieldset>
        <legend>{t('distanceLegend')}</legend>
        <div className="selection-grid selection-grid--distance">
          {[2, 5, 15].map(distance => <SelectionCard key={distance} type="radio" name="distance" value={distance} title={t('distance', { distance })} checked={preferences.distance === distance} onChange={() => onChange({ distance })} />)}
        </div>
        <p className="field-help">{t('distanceHelp')}</p>
      </fieldset>
    </div>
  );
}
