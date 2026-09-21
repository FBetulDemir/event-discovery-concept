import { Check } from 'lucide-react';

export function MatchReasons({ reasons }: { reasons: readonly string[] }) {
  return (
    <ul className="match-reasons" aria-label="Därför passar eventet">
      {reasons.map(reason => (
        <li key={reason}><Check size={14} aria-hidden="true" /><span>{reason}</span></li>
      ))}
    </ul>
  );
}
