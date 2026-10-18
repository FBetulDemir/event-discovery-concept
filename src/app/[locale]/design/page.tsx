import { ArrowUpRight, Search, Trash2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { eventTemplates } from '@/data/events';
import type { Event } from '@/types/event';
import type { Reason } from '@/lib/matching';
import { localizeEvent } from '@/lib/i18n/events';
import { PageContainer } from '@/components/layout/PageContainer';
import { Logo, NotchMark } from '@/components/brand/Logo';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Tag } from '@/components/ui/Tag';
import { Field } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventCard } from '@/components/events/EventCard';
import { VoteDemo } from '@/components/design/VoteDemo';
import { ThemeSwitch } from '@/components/design/ThemeSwitch';

export const generateMetadata = titleFor('design', { robots: { index: false, follow: false } });

const baseSample: Event = { ...eventTemplates[0], source: 'demo', externalId: eventTemplates[0].id, ticketUrl: null };

const demoReasons: Reason[] = [
  { kind: 'mood', mood: 'Dansa' }, { kind: 'priceUnknown' }, { kind: 'when', when: 'tonight', date: '2026-09-25', time: '22:00' },
];
const roles = ['bg', 'surface-1', 'surface-2', 'surface-3', 'ink', 'ink-muted', 'ink-subtle', 'accent', 'paper', 'danger', 'success', 'warning'];
const steps = [
  { name: 'display', className: 'display' },
  { name: 'head', className: 'head' },
  { name: 'lead', className: 'lead' },
  { name: 'body', className: '' },
  { name: 'small', className: 'small muted' },
] as const;

/** Living reference for tokens and components (docs/design/components). Not linked from the app. */
export default async function DesignPage({ params }: LocaleParams) {
  await pageLocale(params);
  const t = await getTranslations('design');
  const all = await getTranslations();
  const sample = localizeEvent(baseSample, all);
  const unknownPrice: Event = { ...sample, price: null, title: t('cards.unknownPrice') };
  return (
    <PageContainer>
      <div className="page design">
        <h1 className="head">{t('title')}</h1>
        <p className="lead muted measure">{t.rich('lead', { code: chunks => <code>{chunks}</code> })}</p>
        <ThemeSwitch />

        <section aria-labelledby="d-brand" className="design__section">
          <h2 id="d-brand" className="lead">{t('brand')}</h2>
          <div className="design__row"><Logo /><NotchMark className="design__notch" /></div>
        </section>

        <section aria-labelledby="d-colour" className="design__section">
          <h2 id="d-colour" className="lead">{t('colour')}</h2>
          <ul className="design__swatches">
            {roles.map(role => (
              <li key={role}>
                <span className="design__swatch" style={{ background: `var(--${role})` }} aria-hidden="true" />
                <code>{role}</code>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="d-type" className="design__section">
          <h2 id="d-type" className="lead">{t('type.title')}</h2>
          <ul className="design__type">
            {steps.map(step => <li key={step.name}><p className={step.className}>{t(`type.${step.name}`)}</p><code className="small muted">{step.name}</code></li>)}
          </ul>
        </section>

        <section aria-labelledby="d-actions" className="design__section">
          <h2 id="d-actions" className="lead">{t('actions.title')}</h2>
          <div className="design__row">
            <Button>{t('actions.primary')}<ArrowUpRight size={18} aria-hidden="true" /></Button>
            <Button variant="secondary">{t('actions.secondary')}</Button>
            <Button variant="ghost">{t('actions.ghost')}</Button>
            <Button disabled>{t('actions.disabled')}</Button>
            <ButtonLink href="/match" variant="secondary">{t('actions.asLink')}</ButtonLink>
            <IconButton label={t('actions.remove')}><Trash2 size={18} aria-hidden="true" /></IconButton>
          </div>
          <div className="design__row">
            <Chip selected>{all('moods.Dansa')}</Chip><Chip>{all('moods.Livemusik')}</Chip><Chip>{all('moods.Skratta')}</Chip>
            <Tag>{all('categories.Klubb')}</Tag><Tag tone="paper">{all('categories.Livemusik')}</Tag><Tag tone="accent">{t('actions.new')}</Tag>
          </div>
        </section>

        <section aria-labelledby="d-fields" className="design__section">
          <h2 id="d-fields" className="lead">{t('fields.title')}</h2>
          <div className="design__fields">
            <Field label={t('fields.name')} placeholder={t('fields.namePlaceholder')} />
            <Field label={t('fields.withHint')} hint={t('fields.hint')} defaultValue={t('fields.hintValue')} />
            <Field label={t('fields.withError')} error={t('fields.error')} defaultValue="" />
            <Field label={t('fields.readonly')} readOnly defaultValue={all('cities.Göteborg')} />
            <p className="muted"><Search size={16} aria-hidden="true" /> {t('fields.searchNote')}</p>
          </div>
        </section>

        <section aria-labelledby="d-cards" className="design__section">
          <h2 id="d-cards" className="lead">{t('cards.title')}</h2>
          <div className="design__cards">
            <EventCard event={sample} />
            <EventCard event={unknownPrice} recommendation={{ reasons: demoReasons, rank: 1 }} />
            <div className="design__vote"><VoteDemo event={sample} /></div>
          </div>
        </section>

        <section aria-labelledby="d-language" className="design__section">
          <h2 id="d-language" className="lead">{t('language.title')}</h2>
          <div className="design__row"><LanguageToggle /><p className="muted">{t('language.note')}</p></div>
        </section>

        <section aria-labelledby="d-states" className="design__section">
          <h2 id="d-states" className="lead">{t('states')}</h2>
          <div className="design__row design__row--top">
            <div className="design__skeletons"><Skeleton className="skeleton--row" /><Skeleton className="skeleton--row" /></div>
            <EmptyState title={all('home.browse.emptyTitle')} action={<Button variant="secondary">{all('home.browse.reset')}</Button>}>{all('home.browse.emptyBody')}</EmptyState>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
