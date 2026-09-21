'use client';

import Link from 'next/link';
import { ArrowUpRight, AudioLines } from 'lucide-react';
import { usePreferences } from '@/components/monkey-match/PreferencesProvider';

export function MatchPromo() {
  const { resetPreferences } = usePreferences();

  return (
    <aside className="match-promo" aria-labelledby="match-promo-title">
      <div className="promo-art" aria-hidden="true"><AudioLines /><span>DIN VIBE.<br />DIN KVÄLL.</span></div>
      <div className="promo-copy"><p className="eyebrow">MÖT MONKEY MATCH <span className="new-label">NYHET</span></p><h2 id="match-promo-title">Vet du inte vad du är sugen på?</h2><p>Berätta lite om kvällen så hittar vi event som passar.</p></div>
      {/* Starts a brand-new search — clear any earlier picks instead of carrying them over. */}
      <Link href="/monkey-match" onClick={resetPreferences} className="button button--primary">Starta Monkey Match <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </aside>
  );
}
