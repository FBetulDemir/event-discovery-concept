'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { AudioLines, Compass, Ticket } from 'lucide-react';
import { usePreferences } from '@/components/match/PreferencesProvider';
import { navItems } from './Header';
import { useNotifications } from '@/components/notifications/NotificationsProvider';

const icons = { '/': Compass, '/match': AudioLines, '/plan': Ticket } as const;

/** Mobile only: the three primary destinations, always labelled. */
export function BottomNav() {
  const { resetPreferences } = usePreferences();
  const pathname = usePathname();
  const { total } = useNotifications();
  const t = useTranslations('shell');

  return (
    <nav className="bottom-nav" aria-label={t('header.mainNav')}>
      {navItems.map(item => {
        const Icon = icons[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={item.href === '/match' ? resetPreferences : undefined}
            aria-current={item.match(pathname) ? 'page' : undefined}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{t(`nav.${item.label}`)}</span>
            {item.href === '/plan' && total > 0 && <span className="nav-badge nav-badge--dot" role="status" aria-label={t('header.news', { count: total })}>{total}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
