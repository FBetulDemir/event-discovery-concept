'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <nav className="bottom-nav" aria-label="Huvudnavigation">
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
            <span>{item.label}</span>
            {item.href === '/plan' && total > 0 && <span className="nav-badge nav-badge--dot" role="status" aria-label={`${total} ${total === 1 ? 'nyhet' : 'nyheter'}`}>{total}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
