'use client';

import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/useAuth';

/** Header entry to the account page: "Logga in" until there is a real account, then your initial. */
export function AccountLink() {
  const auth = useAuth();
  const t = useTranslations('shell.account');
  if (auth.status === 'loading') return <span className="account-link account-link--pending" aria-hidden="true" />;
  if (auth.status === 'account') {
    return (
      <Link href="/konto" className="account-link account-link--in" aria-label={t('label', { email: auth.email })}>
        <span aria-hidden="true">{auth.email.slice(0, 1).toUpperCase() || <User size={18} />}</span>
      </Link>
    );
  }
  return <Link href="/konto" className="btn btn--ghost account-link">{t('signIn')}</Link>;
}
