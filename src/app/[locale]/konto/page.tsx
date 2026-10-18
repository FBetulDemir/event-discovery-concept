import { PageContainer } from '@/components/layout/PageContainer';
import { AccountPanel } from '@/components/account/AccountPanel';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('account', { robots: { index: false, follow: false } });

export default async function AccountPage({ params }: LocaleParams) {
  await pageLocale(params);
  return (
    <PageContainer>
      <AccountPanel />
    </PageContainer>
  );
}
