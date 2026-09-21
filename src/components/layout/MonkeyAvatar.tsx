/** The round mascot face used for the center button of the mobile bottom nav. */
export function MonkeyAvatar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="32" fill="var(--color-primary)" />
      <path d="M14 27 C14 14 22 7 32 7 C42 7 50 14 50 27 L48 27 C45 18 40 22 36 19 C33 17 32 13 32 13 C32 13 31 17 28 19 C24 22 19 18 16 27 Z" fill="#1A1A17" />
      <path d="M15 29 C15 42 22 50 32 50 C42 50 49 42 49 29 C49 20 42 22 32 22 C22 22 15 20 15 29 Z" fill="#F4E4CC" />
      <rect x="18" y="27" width="13" height="9" rx="4.5" fill="#1A1A17" />
      <rect x="33" y="27" width="13" height="9" rx="4.5" fill="#1A1A17" />
      <rect x="30.5" y="30" width="3" height="3" fill="#1A1A17" />
      <path d="M20 37 L11 35 M20 39 L11 40 M44 37 L53 35 M44 39 L53 40" stroke="#1A1A17" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M27 44 Q32 48 37 44" stroke="#1A1A17" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
