import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/ui/Button';

export async function generateMetadata() {
  const t = await getTranslations('shell.notFound');
  return { title: t('title') };
}

export default async function NotFound() {
  const t = await getTranslations('shell.notFound');
  return (
    <PageContainer>
      <div className="page plan enter">
        <h1 className="head">{t('heading')}</h1>
        <p className="lead muted measure">{t('body')}</p>
        <ButtonLink href="/">{t('home')}</ButtonLink>
      </div>
    </PageContainer>
  );
}
