import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import type { Reason } from '@/lib/matching';
import { describeReason, reasonKey } from '@/lib/i18n/reasons';

/** Why this event matched. Honest, human, never a score (docs/CONTRACTS.md section 3). */
export function MatchReasons({ reasons }: { reasons: readonly Reason[] }) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <ul className="match-reasons" aria-label={t('reasons.label')}>
      {reasons.map(reason => (
        <li key={reasonKey(reason)}><Check size={14} aria-hidden="true" /><span>{describeReason(reason, t, locale)}</span></li>
      ))}
    </ul>
  );
}
