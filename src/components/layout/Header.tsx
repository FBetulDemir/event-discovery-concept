'use client';

import Link from 'next/link';
import { AudioLines, MapPin } from 'lucide-react';
import { usePreferences } from '@/components/monkey-match/PreferencesProvider';

export function Header() {
  const { resetPreferences } = usePreferences();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="VIP Monkey startsida">
          <span className="brand-symbol" aria-hidden="true">m<span>•</span></span>
          <span>VIP MONKEY<sup>®</sup></span>
        </Link>
        <nav className="header-nav" aria-label="Huvudnavigation">
          <Link href="/">Upptäck</Link>
          {/* Entry point for starting a brand-new search — clear any earlier picks (e.g. moods) instead of carrying them over. */}
          <Link href="/monkey-match" onClick={resetPreferences}><AudioLines size={16} aria-hidden="true" /> Monkey Match</Link>
        </nav>
        <span className="header-location"><MapPin size={16} aria-hidden="true" /> Göteborg</span>
      </div>
    </header>
  );
}
