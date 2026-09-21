'use client';

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { defaultPreferences } from '@/data/match-options';
import type { Preferences } from '@/types/preferences';

type PreferencesContextValue = {
  preferences: Preferences;
  setPreferences: Dispatch<SetStateAction<Preferences>>;
  completed: boolean;
  setCompleted: Dispatch<SetStateAction<boolean>>;
  /** Clears the draft back to defaults — for entry points that start a brand-new search, as opposed to editing the current one. */
  resetPreferences: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/** Keeps the draft across client-side route changes; a full reload starts a new session. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [completed, setCompleted] = useState(false);

  function resetPreferences() {
    setPreferences(defaultPreferences);
    setCompleted(false);
  }

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, completed, setCompleted, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences requires PreferencesProvider');
  return context;
}
