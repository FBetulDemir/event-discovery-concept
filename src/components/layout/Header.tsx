import Link from 'next/link';
import { AudioLines, MapPin } from 'lucide-react';

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="VIP Monkey startsida">
          <span className="brand-symbol" aria-hidden="true">m<span>•</span></span>
          <span>VIP MONKEY<sup>®</sup></span>
        </Link>
        <nav className="header-nav" aria-label="Huvudnavigation">
          <Link href="/">Upptäck</Link>
          <Link href="/monkey-match"><AudioLines size={16} aria-hidden="true" /> Monkey Match</Link>
        </nav>
        <span className="header-location"><MapPin size={16} aria-hidden="true" /> Göteborg</span>
      </div>
    </header>
  );
}
