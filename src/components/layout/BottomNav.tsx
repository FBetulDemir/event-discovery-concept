'use client';

import Link from 'next/link';
import { Compass, Users } from 'lucide-react';
import { usePreferences } from '@/components/monkey-match/PreferencesProvider';

/** Mobile-only, sticky to the bottom: the header nav moves here below the tablet breakpoint. */
export function BottomNav() {
  const { resetPreferences } = usePreferences();

  return (
    <nav className="bottom-nav" aria-label="Huvudnavigation">
      <Link href="/" className="bottom-nav__link" aria-label="Upptäck">
        <Compass size={22} aria-hidden="true" />
      </Link>
      {/* Same reset-on-new-search behavior as the header's Monkey Match link. */}
      <Link href="/monkey-match" onClick={resetPreferences} className="bottom-nav__center" aria-label="Monkey Match">
        <img src="/images/monkey-logo.png" alt="" className="bottom-nav__avatar" width={64} height={64} />
      </Link>
      <Link href="/plan" className="bottom-nav__link" aria-label="Planera med vänner">
        <Users size={22} aria-hidden="true" />
      </Link>
    </nav>
  );
}
