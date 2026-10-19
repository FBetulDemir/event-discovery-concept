import { useTranslations } from 'next-intl';

const steps = [
  { key: 'match', image: '/images/city/night-579.jpg' },
  { key: 'send', image: '/images/city/night-171.jpg' },
  { key: 'vote', image: '/images/city/night-195.jpg' },
  { key: 'go', image: '/images/city/night-220.jpg' },
] as const;

/** One verb at a time. The verbs, read in order, are the heading and the sequence. */
export function HowItWorks() {
  const t = useTranslations('home.how');
  return (
    <section className="how" aria-labelledby="how-title">
      <h2 id="how-title" className="sr-only">{t('heading')}</h2>
      <ol>
        {steps.map(step => (
          <li key={step.key} className="how__panel">
            <img className="how__photo" src={step.image} alt="" width={1600} height={1000} loading="lazy" />
            <div className="how__scrim" aria-hidden="true" />
            <p className="how__verb display" data-reveal>{t(`${step.key}Verb`)}</p>
            <p className="how__text" data-reveal style={{ '--i': 1 } as React.CSSProperties}>{t(`${step.key}Text`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
