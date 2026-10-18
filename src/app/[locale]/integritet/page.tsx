import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('privacy');

/**
 * What Gänget collects and why, in plain words. Also satisfies the Ticketmaster API terms, which
 * require telling visitors how data is collected, used, stored and disclosed.
 */
export default async function PrivacyPage({ params }: LocaleParams) {
  await pageLocale(params);
  const t = await getTranslations('privacy');
  const rich = { b: (chunks: React.ReactNode) => <strong>{chunks}</strong> };

  return (
    <PageContainer>
      <article className="page plan legal enter">
        <h1 className="head">{t('title')}</h1>
        <p className="lead muted measure">{t('lead')}</p>

        <section>
          <h2 className="lead">{t('stored.title')}</h2>
          <ul>
            <li>{t.rich('stored.guest', rich)}</li>
            <li>{t.rich('stored.name', rich)}</li>
            <li>{t.rich('stored.plans', rich)}</li>
            <li>{t.rich('stored.account', rich)}</li>
            <li>{t.rich('stored.browser', rich)}</li>
          </ul>
        </section>

        <section>
          <h2 className="lead">{t('who.title')}</h2>
          <ul>
            <li>{t('who.plan')}</li>
            <li>{t('who.comments')}</li>
            <li>{t('who.sell')}</li>
          </ul>
        </section>

        <section>
          <h2 className="lead">{t('events.title')}</h2>
          <p>{t('events.body')}</p>
        </section>

        <section>
          <h2 className="lead">{t('where.title')}</h2>
          <p>{t('where.body')}</p>
        </section>

        <section>
          <h2 className="lead">{t('choices.title')}</h2>
          <p>{t('choices.body')}</p>
        </section>

        <p className="small muted">{t('footnote')}</p>
      </article>
    </PageContainer>
  );
}
