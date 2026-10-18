'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';

const year = 2026;

function Notes() {
  return (
    <>
      <p>Evenemangen kommer från säljarna, i dag Ticketmaster. Vi säljer inga biljetter, vi hjälper gänget att bestämma.</p>
      <p>Gänget är ett oberoende koncept och är inte kopplat till någon biljettsäljare.</p>
    </>
  );
}

function Credits() {
  return (
    <>
      <p>Foton: Matthew Skinner, Robin Röcker, Israel Sundseth, Riley Briggs via Unsplash.</p>
      <p><Link href="/integritet">Integritet och data</Link></p>
    </>
  );
}

/** The home page closes with a full designed field; app screens get a slim footer. */
export function Footer() {
  const pathname = usePathname();

  if (pathname !== '/') {
    return (
      <footer className="site-footer site-footer--slim">
        <div className="page site-footer__slim-inner">
          <Logo />
          <div className="site-footer__notes"><Notes /></div>
          <div className="site-footer__credits"><Credits /><p>Göteborg {year}</p></div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="page site-footer__inner">
        <div className="site-footer__top">
          <Logo />
          <div className="site-footer__notes"><Notes /></div>
          <a href="#main-content" className="site-footer__up">Till toppen</a>
        </div>
        <p className="site-footer__line display" aria-label="Vi ses ute">
          Vi ses<br />ute.
        </p>
        <div className="site-footer__meta">
          <nav aria-label="Sidfot">
            <Link href="/match">Match</Link>
            <Link href="/plan">Planer</Link>
          </nav>
          <Credits />
          <p>Göteborg {year}</p>
        </div>
      </div>
    </footer>
  );
}
