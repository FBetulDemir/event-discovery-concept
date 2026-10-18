import { useTranslations } from 'next-intl';

export function BackendNotice() {
  const t = useTranslations('plan.backend');
  return (
    <section className="page plan" aria-labelledby="backend-title">
      <h1 id="backend-title" className="head">{t('title')}</h1>
      <p>{t('body')}</p>
    </section>
  );
}
