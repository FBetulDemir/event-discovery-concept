/** Placeholder block while data loads. Purely visual: pair with an aria-busy region. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton${className ? ` ${className}` : ''}`} aria-hidden="true" />;
}
