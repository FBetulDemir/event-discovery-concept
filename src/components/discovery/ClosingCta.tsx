'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

/** The closing sentence has a gap in it, and the gap is the form. */
export function ClosingCta() {
  const router = useRouter();
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
          <h2 id="cta-title" className="cta__lead">Samla gänget:</h2>
          <label className="cta__field">
            <span className="sr-only">Vad ska planen heta?</span>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Fredag kväll" maxLength={80} autoComplete="off" />
          </label>
          <button type="submit" className="cta__submit">Skapa</button>
        </div>
        <p className="muted" data-reveal style={{ '--i': 1 } as React.CSSProperties}>Du får en länk att skicka. Vännerna röstar utan konto.</p>
      </form>
    </section>
  );
}
