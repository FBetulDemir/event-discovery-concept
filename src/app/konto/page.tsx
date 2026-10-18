import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { AccountPanel } from '@/components/account/AccountPanel';

export const metadata: Metadata = { title: 'Konto', robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <PageContainer>
      <AccountPanel />
    </PageContainer>
  );
}
