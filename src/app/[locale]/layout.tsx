import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Anton, Work_Sans } from 'next/font/google';
import '@/styles/index.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { PreferencesProvider } from '@/components/match/PreferencesProvider';
import { RevealObserver } from '@/components/ui/Reveal';
import { NotificationsProvider } from '@/components/notifications/NotificationsProvider';

const anton = Anton({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-anton', display: 'swap' });
const workSans = Work_Sans({ weight: ['400', '600'], subsets: ['latin', 'latin-ext'], variable: '--font-work-sans', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'shell.meta' });
  return { title: { default: t('title'), template: '%s | Gänget' }, description: t('description') };
}

// Marks the document as script-enabled before first paint, so entrance animations only hide
// content when they can also reveal it.
const enableScript = `document.documentElement.classList.add('js');try{var t=localStorage.getItem('ganget-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('shell');

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning className={`${anton.variable} ${workSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <a className="skip-link" href="#main-content">{t('skipLink')}</a>
          <RevealObserver />
          <PreferencesProvider>
            <NotificationsProvider>
              <Header />
              {children}
              <Footer />
              <BottomNav />
            </NotificationsProvider>
          </PreferencesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
