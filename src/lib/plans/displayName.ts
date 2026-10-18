const KEY = 'mm.displayName';

/** Remembers the name you used, as a convenience only. Storage can be unavailable; that is fine. */
export function rememberedName(): string {
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function rememberName(name: string): void {
  try {
    window.localStorage.setItem(KEY, name);
  } catch {
    // Ignore: the name is just not prefilled next time.
  }
}
