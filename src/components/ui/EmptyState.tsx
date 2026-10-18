import type { ReactNode } from 'react';

/** An invitation, not an apology: say what the space is, then offer the next step. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <h3 className="lead">{title}</h3>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}
