import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { MatchesHandoff } from '@/components/monkey-match/MatchesHandoff';

export const metadata: Metadata = { title: 'Dina val | Monkey Match' };

export default function MatchesPage() {
  return <PageContainer><MatchesHandoff /></PageContainer>;
}
