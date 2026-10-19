import { loadCatalog } from '@/lib/events/catalog';

/**
 * The merged event catalogue. Upstream calls are cached for a few minutes inside the sources
 * (SOURCE_REVALIDATE_SECONDS); the short CDN cache here only absorbs bursts. Changes at a source
 * show up on the next refresh after that window.
 */
export async function GET() {
  const catalog = await loadCatalog();
  return Response.json(catalog, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
