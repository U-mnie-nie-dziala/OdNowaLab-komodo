import type { Company, PartnerMapMarker } from "@/lib/types";

/** Browser path for company photo (proxied via next.config rewrites) */
export function companyImageUrl(id: number) {
  return `/api/companies/${id}/image`;
}

/**
 * API stores coordinates as locationX / locationY.
 * Sample values (52.23, 21.01) match Wołomin ≈ lat/lng, so:
 *   locationX → latitude
 *   locationY → longitude
 */
export function hasValidCoordinates(company: Company): boolean {
  const { locationX: lat, locationY: lng } = company;
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function toPartnerMapMarker(company: Company): PartnerMapMarker | null {
  if (!hasValidCoordinates(company)) return null;
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    lat: company.locationX,
    lng: company.locationY,
    isInRevitalizationZone: company.isInRevitalizationZone,
    imageUrl: company.picture ? companyImageUrl(company.id) : null,
  };
}

export function toPartnerMapMarkers(companies: Company[]): PartnerMapMarker[] {
  return companies
    .map(toPartnerMapMarker)
    .filter((m): m is PartnerMapMarker => m != null);
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
