'use client';

import { useEffect, useState } from 'react';
import { getEvents } from '@/data/events';
import type { Event } from '@/types/event';

/** Hydration-safe clock, refreshed while a prototype page stays open. */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    const refresh = () => setEvents(getEvents());
    refresh();
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return events;
}
