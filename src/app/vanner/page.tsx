import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { FriendsPanel } from '@/components/friends/FriendsPanel';

export const metadata: Metadata = { title: 'Vänner', robots: { index: false, follow: false } };

export default function FriendsPage() {
  return (
    <PageContainer>
      <FriendsPanel />
    </PageContainer>
  );
}
