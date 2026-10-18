import { Check } from 'lucide-react';

/** Why this event matched. Honest, human, never a score (docs/CONTRACTS.md section 3). */
export function MatchReasons({ reasons }: { reasons: readonly string[] }) {
  return (
    <ul className="match-reasons" aria-label="Därför passar eventet">
      {reasons.map(reason => (
        <li key={reason}><Check size={14} aria-hidden="true" /><span>{reason}</span></li>
      ))}
    </ul>
  );
}
