import { Link } from '@/i18n/navigation';
import type { ComponentProps } from 'react';
import { ArrowLeft } from 'lucide-react';

/** Icon-only "back" link: the accessible name is the label, so no text sits above the page heading. */
export function BackLink({ label, className = '', ...props }: Omit<ComponentProps<typeof Link>, 'aria-label' | 'children'> & { label: string }) {
  return (
    <Link {...props} aria-label={label} title={label} className={`icon-btn back-link${className ? ` ${className}` : ''}`}>
      <ArrowLeft size={20} aria-hidden="true" />
    </Link>
  );
}
