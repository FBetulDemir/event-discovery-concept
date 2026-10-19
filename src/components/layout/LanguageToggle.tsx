'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

/**
 * SV | EN in the header. Each option is a real link (so it works without script and crawlers see
 * both languages) that, on click, keeps the query string (`?kod=`, `?event=`) and sets the
 * NEXT_LOCALE cookie through next-intl's router. The current language is marked with aria-current.
 */
export function LanguageToggle() {
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('shell.language');

  return (
    <div className="lang-toggle" role="group" aria-label={t('label')}>
      {routing.locales.map(locale => (
        <a
          key={locale}
          // The unprefixed form is Swedish; the English one carries its prefix.
          href={locale === routing.defaultLocale ? pathname : `/${locale}${pathname === '/' ? '' : pathname}`}
          lang={locale}
          hrefLang={locale}
          aria-label={t(locale)}
          aria-current={locale === active ? 'true' : undefined}
          onClick={event => {
            event.preventDefault();
            if (locale === active) return;
            const query = Object.fromEntries(new URLSearchParams(window.location.search));
            router.replace({ pathname, query }, { locale });
          }}
        >
          {locale.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
