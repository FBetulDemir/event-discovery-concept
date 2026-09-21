'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AudioLines, MapPin } from 'lucide-react';
import { usePreferences } from '@/components/monkey-match/PreferencesProvider';

export function Header() {
  const { resetPreferences } = usePreferences();
  const pathname = usePathname();
  const onMatchFlow = pathname === '/monkey-match' || pathname === '/matches' || pathname.startsWith('/plan');

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="VIP Monkey startsida">
          <img src="/images/cropped-VIP_Monkey_Liggande_RGB_neg-on-white-scaled-1.png.webp" alt="VIP Monkey" width={200} height={50} />
        </Link>
        <nav className="header-nav" aria-label="Huvudnavigation">
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Upptäck</Link>
          {/* Entry point for starting a brand-new search: clear any earlier picks (e.g. moods) instead of carrying them over. */}
          <Link href="/monkey-match" onClick={resetPreferences} aria-current={onMatchFlow ? 'page' : undefined}><AudioLines size={16} aria-hidden="true" /> Monkey Match</Link>
        </nav>
        <span className="header-location"><MapPin size={16} aria-hidden="true" /> Göteborg</span>
      </div>
    </header>
  );
}
