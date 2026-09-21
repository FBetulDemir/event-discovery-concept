export type EventCategory = 'Klubb' | 'Livemusik' | 'Stand-up' | 'Bar & häng';

export type Event = {
  id: string;
  title: string;
  slug: string;
  image: string;
  imageAlt: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  distanceKm: number;
  price: number;
  category: EventCategory;
  moods: string[];
  ageRestriction: number;
  available: boolean;
  description: string;
};
