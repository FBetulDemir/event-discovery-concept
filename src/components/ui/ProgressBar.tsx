import { Check } from 'lucide-react';

export function ProgressBar({ step, labels }: { step: number; labels: readonly string[] }) {
  return (
    <div className="flow-progress">
      <div className="flow-progress__track" role="progressbar" aria-label="Dina preferenser" aria-valuemin={1} aria-valuemax={labels.length} aria-valuenow={step + 1} aria-valuetext={`Steg ${step + 1} av ${labels.length}: ${labels[step]}`}>
        {labels.map((label, index) => <span key={label} className={index <= step ? 'is-complete' : ''} />)}
      </div>
      <ol className="flow-progress__labels">
        {labels.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined} className={index <= step ? 'is-complete' : ''}>
            <span className="flow-progress__number" aria-hidden="true">{index < step ? <Check size={14} /> : index + 1}</span>{label}
          </li>
        ))}
      </ol>
    </div>
  );
}
