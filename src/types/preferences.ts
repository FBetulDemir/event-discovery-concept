export type Mood = 'Dansa' | 'Livemusik' | 'Skratta' | 'Hänga';

export type DateSelection =
  | { mode: 'flexible' }
  | { mode: 'single'; start: string }
  | { mode: 'range'; start: string | null; end: string | null };

export type Preferences = {
  location: string;
  date: DateSelection;
  distance: number;
  moods: Mood[];
  /** null means no price limit; zero means free entry only. */
  budget: number | null;
};
