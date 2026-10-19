'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '@/components/brand/Logo';
import { usePreferences } from '@/components/match/PreferencesProvider';
import { ThemeToggle } from './ThemeToggle';
import { AccountLink } from './AccountLink';
import { LanguageToggle } from './LanguageToggle';
import { useNotifications } from '@/components/notifications/NotificationsProvider';

export const navItems = [
  { href: '/', label: 'explore', match: (path: string) => path === '/' || path.startsWith('/events') },
  { href: '/match', label: 'match', match: (path: string) => path.startsWith('/match') },
  { href: '/plan', label: 'plans', match: (path: string) => path.startsWith('/plan') },
] as const;

export function Header() {
  const { resetPreferences } = usePreferences();
  const pathname = usePathname();
  const { total } = useNotifications();
  const t = useTranslations('shell');

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="site-header__brand" aria-label={t('header.homeLabel')}>
          <Logo />
        </Link>
        <nav className="site-header__nav" aria-label={t('header.mainNav')}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.href === '/match' ? resetPreferences : undefined}
              aria-current={item.match(pathname) ? 'page' : undefined}
            >
              {t(`nav.${item.label}`)}
              {item.href === '/plan' && total > 0 && <span className="nav-badge" role="status" aria-label={t('header.news', { count: total })}>{total}</span>}
            </Link>
          ))}
        </nav>
        <div className="site-header__tools"><AccountLink /><LanguageToggle /><ThemeToggle /></div>
      </div>
    </header>
  );
}
