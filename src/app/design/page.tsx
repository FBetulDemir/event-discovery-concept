import type { Metadata } from 'next';
import { ArrowUpRight, Search, Trash2 } from 'lucide-react';
import { eventTemplates } from '@/data/events';
import type { Event } from '@/types/event';
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

export const metadata: Metadata = { title: 'Designsystem', robots: { index: false, follow: false } };

const sample: Event = { ...eventTemplates[0], source: 'demo', externalId: eventTemplates[0].id, ticketUrl: null };
const unknownPrice: Event = { ...sample, price: null, title: 'Event utan angivet pris' };

const roles = ['bg', 'surface-1', 'surface-2', 'surface-3', 'ink', 'ink-muted', 'ink-subtle', 'accent', 'paper', 'danger', 'success', 'warning'];
const steps = [
  { name: 'display', className: 'display', sample: 'Vad gör vi ikväll?' },
  { name: 'head', className: 'head', sample: 'Det händer ikväll' },
  { name: 'lead', className: 'lead', sample: 'Riktiga kvällar i Göteborg.' },
  { name: 'body', className: '', sample: 'Välj känsla, skicka länken, låt gänget rösta. Löpande text i 17 till 19 pixlar.' },
  { name: 'small', className: 'small muted', sample: 'Pris ej angivet · 1,3 km' },
];

/** Living reference for tokens and components (docs/design/components). Not linked from the app. */
export default function DesignPage() {
  return (
    <PageContainer>
      <div className="page design">
        <h1 className="head">Gänget designsystem</h1>
        <p className="lead muted measure">Tokens och komponenter på ett ställe. Källa: <code>src/styles/tokens.css</code> och <code>docs/brand/GUIDELINES.md</code>.</p>
        <ThemeSwitch />

        <section aria-labelledby="d-brand" className="design__section">
          <h2 id="d-brand" className="lead">Märke</h2>
          <div className="design__row"><Logo /><NotchMark className="design__notch" /></div>
        </section>

        <section aria-labelledby="d-colour" className="design__section">
          <h2 id="d-colour" className="lead">Färg: roller</h2>
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
          <h2 id="d-type" className="lead">Typografi: fem steg</h2>
          <ul className="design__type">
            {steps.map(step => <li key={step.name}><p className={step.className}>{step.sample}</p><code className="small muted">{step.name}</code></li>)}
          </ul>
        </section>

        <section aria-labelledby="d-actions" className="design__section">
          <h2 id="d-actions" className="lead">Knappar och val</h2>
          <div className="design__row">
            <Button>Hitta kvällen<ArrowUpRight size={18} aria-hidden="true" /></Button>
            <Button variant="secondary">Kopiera</Button>
            <Button variant="ghost">Tillbaka</Button>
            <Button disabled>Avstängd</Button>
            <ButtonLink href="/match" variant="secondary">Som länk</ButtonLink>
            <IconButton label="Ta bort"><Trash2 size={18} aria-hidden="true" /></IconButton>
          </div>
          <div className="design__row">
            <Chip selected>Dansa</Chip><Chip>Livemusik</Chip><Chip>Skratta</Chip>
            <Tag>Klubb</Tag><Tag tone="paper">Livemusik</Tag><Tag tone="accent">Ny</Tag>
          </div>
        </section>

        <section aria-labelledby="d-fields" className="design__section">
          <h2 id="d-fields" className="lead">Fält</h2>
          <div className="design__fields">
            <Field label="Ditt namn" placeholder="Alex" />
            <Field label="Med hjälptext" hint="Visas för alla i planen." defaultValue="Fredag kväll" />
            <Field label="Med fel" error="Skriv ett namn." defaultValue="" />
            <Field label="Skrivskyddat" readOnly defaultValue="Göteborg" />
            <p className="muted"><Search size={16} aria-hidden="true" /> Sökfält och val följer samma stil.</p>
          </div>
        </section>

        <section aria-labelledby="d-cards" className="design__section">
          <h2 id="d-cards" className="lead">Kort</h2>
          <div className="design__cards">
            <EventCard event={sample} />
            <EventCard event={unknownPrice} recommendation={{ reasons: ['Matchar Dansa', 'Pris ej angivet', 'Ikväll'], rank: 1 }} />
            <div className="design__vote"><VoteDemo event={sample} /></div>
          </div>
        </section>

        <section aria-labelledby="d-states" className="design__section">
          <h2 id="d-states" className="lead">Tillstånd</h2>
          <div className="design__row design__row--top">
            <div className="design__skeletons"><Skeleton className="skeleton--row" /><Skeleton className="skeleton--row" /></div>
            <EmptyState title="Ingen träff den här gången" action={<Button variant="secondary">Rensa filter</Button>}>Testa ett annat sökord eller färre filter.</EmptyState>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
