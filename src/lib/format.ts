/** Entry price as shown to people. `null` means the source does not publish one. */
export function formatPrice(price: number | null): string {
  if (price === null) return 'Pris ej angivet';
  return price === 0 ? 'Fri entré' : `${price} kr`;
}

/** Per-person wording used on detail screens. */
export function formatPricePerPerson(price: number | null): string {
  return price !== null && price > 0 ? `${price} kr / person` : formatPrice(price);
}

export function formatAge(age: number | null): string | null {
  return age === null ? null : `${age} år`;
}

/**
 * "Ikväll", "Imorgon", a weekday within the coming week, otherwise a short date ("31 dec").
 * A bare weekday for something months away reads as "this Thursday", which is wrong.
 */
export function formatWhen(date: string, today: string): string {
  if (date === today) return 'Ikväll';
  const days = Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
  if (days === 1) return 'Imorgon';
  const at = new Date(`${date}T12:00:00Z`);
  if (days > 1 && days <= 6) return new Intl.DateTimeFormat('sv-SE', { weekday: 'long', timeZone: 'UTC' }).format(at);
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(at).replaceAll('.', '');
}
