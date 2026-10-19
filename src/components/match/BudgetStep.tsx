import { useTranslations } from 'next-intl';
import { Banknote, Ticket, Wallet, Infinity as InfinityIcon } from 'lucide-react';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { formatBudget } from '@/data/match-options';

const budgets = [
  { value: 0, description: 'freeDescription', icon: Ticket },
  { value: 200, description: 'cheapDescription', icon: Wallet },
  { value: 400, description: 'moreDescription', icon: Banknote },
  { value: null, description: 'anyDescription', icon: InfinityIcon },
] as const;

export function BudgetStep({ budget, onChange }: { budget: number | null; onChange: (budget: number | null) => void }) {
  const t = useTranslations('match.budget');
  const all = useTranslations();
  return (
    <fieldset className="flow-fields">
      <legend>{t('legend')}</legend>
      <div className="selection-grid">
        {budgets.map(option => <SelectionCard key={String(option.value)} type="radio" name="budget" value={option.value ?? 'any'} title={formatBudget(option.value, all)} description={t(option.description)} icon={option.icon} checked={budget === option.value} onChange={() => onChange(option.value)} />)}
      </div>
      <p className="field-help">{t('help')}</p>
    </fieldset>
  );
}
