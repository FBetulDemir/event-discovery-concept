import { PageContainer } from '@/components/layout/PageContainer';
import { FriendsPanel } from '@/components/friends/FriendsPanel';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('friends', { robots: { index: false, follow: false } });

export default async function FriendsPage({ params }: LocaleParams) {
  await pageLocale(params);
  return (
    <PageContainer>
      <FriendsPanel />
    </PageContainer>
  );
}
