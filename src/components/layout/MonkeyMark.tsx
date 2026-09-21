/** The first "O" in MONKEY, drawn as a monkey face wearing sunglasses. */
export function MonkeyMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 108" className={className} aria-hidden="true" focusable="false">
      <path d="M23 36 C13 25 15 9 29 4 C25 15 27 27 34 36 Z" fill="currentColor" />
      <path d="M77 36 C87 25 85 9 71 4 C75 15 73 27 66 36 Z" fill="currentColor" />
      <circle cx="50" cy="57" r="34" fill="currentColor" />
      <path d="M36 84 C40 100 60 100 64 84 C56 91 44 91 36 84 Z" fill="currentColor" />
      <rect x="26" y="48" width="21" height="17" rx="8.5" style={{ fill: 'var(--color-background)' }} />
      <rect x="53" y="48" width="21" height="17" rx="8.5" style={{ fill: 'var(--color-background)' }} />
      <rect x="45" y="53" width="10" height="6" style={{ fill: 'var(--color-background)' }} />
    </svg>
  );
}
