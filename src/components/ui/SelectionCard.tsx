import { Check, type LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

type SelectionCardProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> & {
  type: 'radio' | 'checkbox';
  title: string;
  description?: string;
  icon?: LucideIcon;
};

/** Native inputs preserve radio-group arrow keys and checkbox keyboard behavior. */
export function SelectionCard({ title, description, icon: Icon, className = '', ...inputProps }: SelectionCardProps) {
  return (
    <label className={`selection-card ${className}`}>
      <input {...inputProps} className="sr-only" />
      <span className="selection-card__body">
        {Icon && <Icon className="selection-card__icon" size={25} aria-hidden="true" />}
        <span className="selection-card__copy">
          <span className="selection-card__title">{title}</span>
          {description && <span className="selection-card__description">{description}</span>}
        </span>
        <span className="selection-card__check" aria-hidden="true"><Check size={14} /></span>
      </span>
    </label>
  );
}
