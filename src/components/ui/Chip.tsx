import type { ComponentPropsWithRef } from 'react';

export type ChipProps = Omit<ComponentPropsWithRef<'button'>, 'aria-pressed'> & {
  selected?: boolean;
};

/** Controlled toggle: the parent owns selection and the click handler. */
export function Chip({
  selected = false,
  type = 'button',
  className = '',
  ...props
}: ChipProps) {
  return (
    <button
      {...props}
      type={type}
      aria-pressed={selected}
      className={`chip ${className}`}
    />
  );
}
