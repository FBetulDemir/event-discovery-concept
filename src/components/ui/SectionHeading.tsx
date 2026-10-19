import type { ReactNode } from 'react';

export type SectionHeadingProps = {
  title: string;
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
  /** Right-aligned counter or action, e.g. "68 event". */
  children?: ReactNode;
  className?: string;
};

/** Section title at the heading step (Anton caps, two lines at most). No eyebrow labels. */
export function SectionHeading({ title, id, as: Heading = 'h2', children, className = '' }: SectionHeadingProps) {
  return (
    <div className={`section-heading${className ? ` ${className}` : ''}`}>
      <Heading id={id} className="head">{title}</Heading>
      {children && <div className="section-heading__aside">{children}</div>}
    </div>
  );
}
