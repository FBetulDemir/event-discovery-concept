import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { MatchResults } from '@/components/monkey-match/MatchResults';

export const metadata: Metadata = { title: 'Dina matchningar | Monkey Match' };

export default function MatchesPage() {
  return <PageContainer className="results-page"><MatchResults /></PageContainer>;
}
