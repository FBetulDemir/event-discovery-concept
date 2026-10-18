/**
 * The Gänget wordmark with its ticket notch (docs/brand/GUIDELINES.md): GÄNGET in the display
 * face on a block with a half-circle bitten out of the left edge. `NotchMark` is the block alone
 * (favicon, avatar). Colours come from tokens: ink on ground, accent for the block.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <NotchMark className="logo__mark" />
      <span className="logo__word">Gänget</span>
    </span>
  );
}

export function NotchMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path fill="currentColor" fillRule="evenodd" d="M0 0h24v24H0V0Zm0 8a4 4 0 0 1 0 8V8Z" />
    </svg>
  );
}
