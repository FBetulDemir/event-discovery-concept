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
