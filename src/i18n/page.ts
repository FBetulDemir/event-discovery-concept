import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from './routing';

export type LocaleParams = { params: Promise<{ locale: string }> };

/** The validated locale of a page, also registered for static rendering (call first in every page). */
export async function pageLocale(params: LocaleParams['params']): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

type TitleKey = 'match' | 'matchResults' | 'plans' | 'newPlan' | 'plan' | 'account' | 'friends' | 'privacy' | 'design' | 'event';

/** `export const generateMetadata = titleFor('match')`: the page title from `shell.titles`, in the page's language. */
export const titleFor = (key: TitleKey, extra: Metadata = {}) => async ({ params }: LocaleParams): Promise<Metadata> => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return extra;
  const t = await getTranslations({ locale, namespace: 'shell.titles' });
  return { title: t(key), ...extra };
};
