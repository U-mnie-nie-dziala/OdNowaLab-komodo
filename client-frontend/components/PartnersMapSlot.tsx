"use client";

import dynamic from "next/dynamic";
import { MapPinIcon, StoreIcon } from "@/components/icons";
import type { PartnerMapMarker } from "@/lib/types";

const PartnersMap = dynamic(
  () => import("./PartnersMap").then((mod) => mod.PartnersMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-lav-100 text-sm text-[var(--ink-soft)]">
        Ładowanie mapy…
      </div>
    ),
  },
);

export function PartnersMapSlot({ markers }: { markers: PartnerMapMarker[] }) {
  return (
    <div className="overflow-hidden border-2 border-[var(--ink)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ink)] bg-lav-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="badge bg-white">
            <MapPinIcon className="h-3.5 w-3.5" /> Mapa partnerów
          </span>
          <span className="text-sm font-bold text-brand-600">
            {markers.length}{" "}
            {markers.length === 1 ? "lokalizacja" : "lokalizacji"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)]">
          <StoreIcon className="h-3.5 w-3.5 text-brand-600" />
          OpenStreetMap · kliknij pinezkę
        </span>
      </div>

      <div className="relative h-[320px] w-full sm:h-[420px]">
        <PartnersMap markers={markers} />
      </div>
    </div>
  );
}
