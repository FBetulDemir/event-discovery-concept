import { AudioLines, Music2, Smile, Wine } from 'lucide-react';
import { SelectionCard } from '@/components/ui/SelectionCard';
import type { Mood } from '@/types/preferences';

const moods = [
  { title: 'Dansa', description: 'En låt till. Och en till.', icon: AudioLines },
  { title: 'Livemusik', description: 'Nära scenen, mitt i känslan.', icon: Music2 },
  { title: 'Skratta', description: 'Släpp veckan med ett skratt.', icon: Smile },
  { title: 'Hänga', description: 'Bra snack och skön stämning.', icon: Wine },
] as const;

export function MoodStep({ selected, onChange }: { selected: Mood[]; onChange: (moods: Mood[]) => void }) {
  return (
    <fieldset className="flow-fields">
      <legend>Välj en eller flera känslor</legend>
      <div className="selection-grid selection-grid--moods">
        {moods.map(mood => <SelectionCard key={mood.title} type="checkbox" name="moods" value={mood.title} {...mood} checked={selected.includes(mood.title)} onChange={() => onChange(selected.includes(mood.title) ? selected.filter(value => value !== mood.title) : [...selected, mood.title])} />)}
      </div>
      <p className="field-help">Öppen för allt? Fortsätt utan att välja, eller hoppa över.</p>
    </fieldset>
  );
}
