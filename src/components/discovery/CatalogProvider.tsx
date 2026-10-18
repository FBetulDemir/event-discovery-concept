'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Event } from '@/types/event';
import { groupSeries } from '@/lib/events/series';
import type { Catalog } from '@/lib/events/catalog';
import { useCatalog } from '@/lib/useEvents';

/** `events` is everything; `listed` collapses repeating shows into one card each. */
type Value = Catalog & { loading: boolean; listed: Event[] };
const CatalogContext = createContext<Value | null>(null);

/**
 * One catalogue for the whole home page: server-rendered first (real events in the first HTML,
 * no flash), then refreshed in the browser on focus and every few minutes.
 */
export function CatalogProvider({ initial, children }: { initial: Catalog; children: ReactNode }) {
  const catalog = useCatalog(initial);
  const listed = useMemo(() => groupSeries(catalog.events), [catalog.events]);
  return <CatalogContext.Provider value={{ ...catalog, listed }}>{children}</CatalogContext.Provider>;
}

export function useHomeCatalog(): Value {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useHomeCatalog requires CatalogProvider');
  return value;
}
