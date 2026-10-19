import type { ComponentPropsWithRef } from 'react';

type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'aria-label'> & { label: string };

/** Icon-only control. The label is required: it is the accessible name. */
export function IconButton({ label, type = 'button', className = '', children, ...props }: IconButtonProps) {
  return <button {...props} type={type} aria-label={label} className={`icon-btn${className ? ` ${className}` : ''}`}>{children}</button>;
}
