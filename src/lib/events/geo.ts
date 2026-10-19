export type LatLng = { lat: number; lng: number };

/** Göteborg city centre (Brunnsparken). Every "distanceKm" in the app is measured from here. */
export const GOTEBORG_CENTRE: LatLng = { lat: 57.7066, lng: 11.9695 };

const EARTH_RADIUS_KM = 6371;
const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance, rounded to 0.1 km (matches how distances are shown). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  return Math.round(km * 10) / 10;
}
