'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '@/components/brand/Logo';

const year = 2026;

function Notes() {
  const t = useTranslations('shell.footer');
  return (
    <>
      <p>{t('sellers')}</p>
      <p>{t('independent')}</p>
    </>
  );
}

function Credits() {
  const t = useTranslations('shell.footer');
  return (
    <>
      <p>{t('photos')}</p>
      <p><Link href="/integritet">{t('privacy')}</Link></p>
    </>
  );
}

/** The home page closes with a full designed field; app screens get a slim footer. */
export function Footer() {
  const pathname = usePathname();
  const t = useTranslations('shell');

  if (pathname !== '/') {
    return (
      <footer className="site-footer site-footer--slim">
        <div className="page site-footer__slim-inner">
          <Logo />
          <div className="site-footer__notes"><Notes /></div>
          <div className="site-footer__credits"><Credits /><p>{t('footer.city', { year })}</p></div>
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
          <a href="#main-content" className="site-footer__up">{t('footer.toTop')}</a>
        </div>
        <p className="site-footer__line display" aria-label={t('footer.seeYouLabel')}>
          {t('footer.seeYou1')}<br />{t('footer.seeYou2')}
        </p>
        <div className="site-footer__meta">
          <nav aria-label={t('footer.navLabel')}>
            <Link href="/match">{t('nav.match')}</Link>
            <Link href="/plan">{t('nav.plans')}</Link>
          </nav>
          <Credits />
          <p>{t('footer.city', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
