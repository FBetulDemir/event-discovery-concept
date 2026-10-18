'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

/** The closing sentence has a gap in it, and the gap is the form. */
export function ClosingCta() {
  const router = useRouter();
  const t = useTranslations('home.cta');
  const [title, setTitle] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const name = title.trim();
    router.push(name ? `/plan/new?title=${encodeURIComponent(name)}` : '/plan/new');
  }

  return (
    <section className="section cta" aria-labelledby="cta-title">
      <form className="page cta__form" onSubmit={submit}>
        <div className="head cta__sentence" data-reveal>
          <h2 id="cta-title" className="cta__lead">{t('lead')}</h2>
          <label className="cta__field">
            <span className="sr-only">{t('fieldLabel')}</span>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder={t('placeholder')} maxLength={80} autoComplete="off" />
          </label>
          <button type="submit" className="cta__submit">{t('submit')}</button>
        </div>
        <p className="muted" data-reveal style={{ '--i': 1 } as React.CSSProperties}>{t('note')}</p>
      </form>
    </section>
  );
}
