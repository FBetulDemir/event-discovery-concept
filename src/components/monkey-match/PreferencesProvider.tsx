'use client';

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { defaultPreferences } from '@/data/match-options';
import type { Preferences } from '@/types/preferences';

type PreferencesContextValue = {
  preferences: Preferences;
  setPreferences: Dispatch<SetStateAction<Preferences>>;
  completed: boolean;
  setCompleted: Dispatch<SetStateAction<boolean>>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/** Keeps the draft across client-side route changes; a full reload starts a new session. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [completed, setCompleted] = useState(false);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, completed, setCompleted }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences requires PreferencesProvider');
  return context;
}
