import { Banknote, Ticket, Wallet, Infinity as InfinityIcon } from 'lucide-react';
import { SelectionCard } from '@/components/ui/SelectionCard';

const budgets = [
  { value: 0, title: 'Fri entré', description: 'Mer kvar till resten av kvällen.', icon: Ticket },
  { value: 200, title: 'Upp till 200 kr', description: 'En bra kväll till ett bra pris.', icon: Wallet },
  { value: 400, title: 'Upp till 400 kr', description: 'Lite mer utrymme för upplevelser.', icon: Banknote },
  { value: null, title: 'Ingen prisgräns', description: 'Visa alla alternativ.', icon: InfinityIcon },
];

export function BudgetStep({ budget, onChange }: { budget: number | null; onChange: (budget: number | null) => void }) {
  return (
    <fieldset className="flow-fields">
      <legend>Biljettpris per person</legend>
      <div className="selection-grid">
        {budgets.map(option => <SelectionCard key={String(option.value)} type="radio" name="budget" value={option.value ?? 'any'} title={option.title} description={option.description} icon={option.icon} checked={budget === option.value} onChange={() => onChange(option.value)} />)}
      </div>
      <p className="field-help">Gäller entré eller biljett. Mat, dryck och resa ingår inte.</p>
    </fieldset>
  );
}
