import type { ReactNode } from 'react';

export type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
  children?: ReactNode;
  className?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  id,
  as: Heading = 'h2',
  children,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`section-heading ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading id={id}>{title}</Heading>
      </div>
      {children && <div className="section-heading__aside">{children}</div>}
    </div>
  );
}
