import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useId } from 'react';

type FieldProps = Omit<ComponentPropsWithRef<'input'>, 'id'> & {
  label: string;
  hint?: ReactNode;
  error?: string | null;
};

/** Label + input + hint + error, wired with ids. Every input in the app goes through this. */
export function Field({ label, hint, error, className = '', ...inputProps }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={`field${error ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      />
      {hint && <p id={hintId} className="field__hint">{hint}</p>}
      {error && <p id={errorId} className="field__error" role="alert">{error}</p>}
    </div>
  );
}
