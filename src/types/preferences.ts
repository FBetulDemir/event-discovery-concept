export type Mood = 'Dansa' | 'Livemusik' | 'Skratta' | 'Hänga';

export type Preferences = {
  location: string;
  date: string;
  distance: number;
  moods: Mood[];
  /** null means no price limit; zero means free entry only. */
  budget: number | null;
};
