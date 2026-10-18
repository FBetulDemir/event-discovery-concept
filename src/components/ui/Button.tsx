import Link from 'next/link';
import type { ComponentPropsWithRef, ComponentProps } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const buttonClass = (variant: ButtonVariant = 'primary', className = '') =>
  `btn btn--${variant}${className ? ` ${className}` : ''}`;

export type ButtonProps = ComponentPropsWithRef<'button'> & { variant?: ButtonVariant };

/** The one button shape: square, 48px tall. Primary is the single accent action on a screen. */
export function Button({ type = 'button', variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button {...props} type={type} className={buttonClass(variant, className)} />;
}

export type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

/** An internal link that looks like a button. */
export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}
