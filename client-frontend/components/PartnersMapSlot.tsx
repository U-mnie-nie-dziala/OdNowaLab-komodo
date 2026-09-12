"use client";

import { MapPinIcon, StoreIcon } from "@/components/icons";
import type { PartnerMapMarker } from "@/lib/types";

/**
 * Placeholder for a future interactive map (Leaflet / MapLibre / Google).
 * Pass `markers` from `toPartnerMapMarkers(companies)` — same shape the map will use.
 */
export function PartnersMapSlot({ markers }: { markers: PartnerMapMarker[] }) {
  return (
    <div
      className="relative flex min-h-[220px] flex-col justify-between overflow-hidden border-2 border-[var(--ink)] bg-lav-200 p-6 sm:min-h-[280px]"
      data-map-ready={markers.length > 0 ? "true" : "false"}
      data-marker-count={markers.length}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-[12%] top-[28%] h-3 w-3 bg-brand-600" />
        <div className="absolute left-[38%] top-[52%] h-3 w-3 bg-brand-600" />
        <div className="absolute left-[61%] top-[34%] h-3 w-3 bg-[var(--ink)]" />
        <div className="absolute left-[74%] top-[62%] h-3 w-3 bg-brand-600" />
        <div className="absolute inset-x-8 top-1/2 border-t border-dashed border-[var(--ink)]/20" />
        <div className="absolute inset-y-8 left-1/2 border-l border-dashed border-[var(--ink)]/20" />
      </div>

      <div className="relative">
        <span className="badge bg-white">
          <MapPinIcon className="h-3.5 w-3.5" /> Mapa partnerów
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-600">
          Wkrótce mapa lokalizacji
        </h2>
        <p className="mt-2 max-w-lg text-sm text-[var(--ink-soft)]">
          Przygotowaliśmy dane lokalizacji ({markers.length}{" "}
          {markers.length === 1 ? "punkt" : "punktów"} z współrzędnymi). Tutaj
          pojawi się interaktywna mapa sklepów partnerskich.
        </p>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 border-2 border-[var(--ink)] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--ink)]">
          <StoreIcon className="h-4 w-4 text-brand-600" />
          {markers.length} na mapie
        </span>
        {markers.slice(0, 3).map((m) => (
          <span
            key={m.id}
            className="hidden border-2 border-[var(--ink)]/15 bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] sm:inline-flex"
            title={`${m.lat}, ${m.lng}`}
          >
            {m.name}
          </span>
        ))}
        {markers.length > 3 && (
          <span className="hidden text-xs font-bold text-brand-600 sm:inline">
            +{markers.length - 3} więcej
          </span>
        )}
      </div>
    </div>
  );
}
