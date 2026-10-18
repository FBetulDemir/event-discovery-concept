'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { usePreferences } from '@/components/match/PreferencesProvider';
import { ThemeToggle } from './ThemeToggle';
import { AccountLink } from './AccountLink';
import { useNotifications } from '@/components/notifications/NotificationsProvider';

export const navItems = [
  { href: '/', label: 'Utforska', match: (path: string) => path === '/' || path.startsWith('/events') },
  { href: '/match', label: 'Match', match: (path: string) => path.startsWith('/match') },
  { href: '/plan', label: 'Planer', match: (path: string) => path.startsWith('/plan') },
] as const;

export function Header() {
  const { resetPreferences } = usePreferences();
  const pathname = usePathname();
  const { total } = useNotifications();

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="Gänget, startsida">
          <Logo />
        </Link>
        <nav className="site-header__nav" aria-label="Huvudnavigation">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.href === '/match' ? resetPreferences : undefined}
              aria-current={item.match(pathname) ? 'page' : undefined}
            >
              {item.label}
              {item.href === '/plan' && total > 0 && <span className="nav-badge" role="status" aria-label={`${total} ${total === 1 ? 'nyhet' : 'nyheter'}`}>{total}</span>}
            </Link>
          ))}
        </nav>
        <div className="site-header__tools"><AccountLink /><ThemeToggle /></div>
      </div>
    </header>
  );
}
