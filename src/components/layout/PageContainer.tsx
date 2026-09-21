import type { ComponentPropsWithRef } from 'react';

export type PageContainerProps = ComponentPropsWithRef<'main'>;

/** Render once per route to provide the main landmark and skip-link target. */
export function PageContainer({
  className = '',
  children,
  ...props
}: PageContainerProps) {
  return (
    <main {...props} id="main-content" tabIndex={-1} className={`page-container ${className}`}>
      {children}
    </main>
  );
}
