import { PageContainer } from '@/components/layout/PageContainer';
import { MatchResults } from '@/components/match/MatchResults';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('matchResults');

export default async function MatchResultsPage({ params }: LocaleParams) {
  await pageLocale(params);
  return <PageContainer className="results-page"><MatchResults /></PageContainer>;
}
