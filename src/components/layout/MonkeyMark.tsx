/** The "M" in the wordmark, drawn as a monkey face wearing sunglasses tucked into its notch. */
export function MonkeyMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 92" className={className} aria-hidden="true" focusable="false">
      <path d="M8 84 V10 L50 52 L92 10 V84" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="40" r="8" fill="currentColor" />
      <circle cx="66" cy="40" r="8" fill="currentColor" />
      <circle cx="50" cy="59" r="20" fill="#E9C9A0" />
      <rect x="33" y="53" width="14" height="11" rx="5.5" fill="#121212" />
      <rect x="53" y="53" width="14" height="11" rx="5.5" fill="#121212" />
      <rect x="46" y="56" width="8" height="4" fill="#121212" />
      <circle cx="50" cy="71" r="2.4" fill="#121212" />
    </svg>
  );
}
