import { MapPin } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { SelectionCard } from '@/components/ui/SelectionCard';
import type { Preferences } from '@/types/preferences';

type Props = { preferences: Preferences; onChange: (patch: Partial<Preferences>) => void };

export function LocationStep({ preferences, onChange }: Props) {
  return (
    <div className="flow-fields">
      <fieldset>
        <legend>När vill du gå ut?</legend>
        <DatePicker value={preferences.date} onChange={date => onChange({ date })} />
        <p className="field-help">Exempelutbudet finns 25–26 september 2026. Andra datum kan ge färre eller inga träffar.</p>
      </fieldset>
      <div className="location-field">
        <label htmlFor="match-location">Var börjar kvällen?</label>
        <div className="location-input"><MapPin size={18} aria-hidden="true" /><input id="match-location" value={preferences.location} readOnly aria-describedby="location-help" /></div>
        <p id="location-help" className="field-help">Den här prototypen har exempel från Göteborg.</p>
      </div>
      <fieldset>
        <legend>Hur långt vill du ta dig?</legend>
        <div className="selection-grid selection-grid--distance">
          {[2, 5, 15].map(distance => <SelectionCard key={distance} type="radio" name="distance" value={distance} title={`${distance} km`} checked={preferences.distance === distance} onChange={() => onChange({ distance })} />)}
        </div>
        <p className="field-help">Avstånd från Göteborgs centrum.</p>
      </fieldset>
    </div>
  );
}
