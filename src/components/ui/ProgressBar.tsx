import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

/** Three-part progress for the Match flow. Position is conveyed by fill, the check and aria-current. */
export function ProgressBar({ step, labels }: { step: number; labels: readonly string[] }) {
  const t = useTranslations('match.progress');
  return (
    <div className="progress" data-reveal>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={t('label')}
        aria-valuemin={1}
        aria-valuemax={labels.length}
        aria-valuenow={step + 1}
        aria-valuetext={t('valueText', { step: step + 1, total: labels.length, label: labels[step] })}
      >
        {labels.map((label, index) => <span key={label} className={index <= step ? 'is-complete' : ''} />)}
      </div>
      <ol className="progress__labels">
        {labels.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined} className={index <= step ? 'is-complete' : ''}>
            {index < step && <Check size={14} aria-hidden="true" />}{label}
          </li>
        ))}
      </ol>
    </div>
  );
}
