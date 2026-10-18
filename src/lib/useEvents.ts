'use client';

import { useEffect, useState } from 'react';
import type { Catalog } from '@/lib/events/catalog';
import type { Event } from '@/types/event';

const REFRESH_MS = 5 * 60_000;
const empty: Catalog = { events: [], sources: [] };

/**
 * The event catalogue from /api/events. Starts from `initial` (server-rendered) or empty (hydration
 * safe), then fills in; refreshes on window focus and every few minutes so source changes show up.
 */
export function useCatalog(initial?: Catalog): Catalog & { loading: boolean } {
  const [catalog, setCatalog] = useState<Catalog>(initial ?? empty);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) return;
        const next = (await response.json()) as Catalog;
        if (!cancelled) setCatalog(next);
      } catch {
        // Keep showing the last good catalogue.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    refresh();
    const interval = window.setInterval(refresh, REFRESH_MS);
    window.addEventListener('focus', refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return { ...catalog, loading };
}

export function useEvents(): Event[] {
  return useCatalog().events;
}
