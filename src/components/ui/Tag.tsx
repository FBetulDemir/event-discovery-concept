import type { ReactNode } from 'react';

/** Static label (category, price, source). Not interactive; use Chip for toggles. */
export function Tag({ children, tone = 'default', className = '' }: { children: ReactNode; tone?: 'default' | 'accent' | 'paper'; className?: string }) {
  return <span className={`tag tag--${tone}${className ? ` ${className}` : ''}`}>{children}</span>;
}
