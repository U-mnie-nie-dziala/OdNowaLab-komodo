"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { PartnerMapMarker } from "@/lib/types";

/** Wołomin — default view when no pins [lat, lng] */
const WOLOMIN: [number, number] = [52.3405, 21.2425];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function PartnersMap({ markers }: { markers: PartnerMapMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      scrollWheelZoom: true,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Call invalidateSize after DOM layout
    const rafId = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timerId = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update markers and view bounds whenever markers change or map is ready
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const validMarkers = (markers || []).filter(
      (m) =>
        Number.isFinite(m.lat) &&
        Number.isFinite(m.lng) &&
        !(m.lat === 0 && m.lng === 0),
    );

    for (const m of validMarkers) {
      const icon = L.divIcon({
        className: "partner-map-pin-wrap",
        html: `
          <button type="button" class="partner-map-pin" aria-label="${escapeHtml(m.name)}">
            <span class="partner-map-pin__dot"></span>
            <span class="partner-map-pin__label">${escapeHtml(m.name)}</span>
          </button>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 36],
        popupAnchor: [0, -28],
      });

      const zone = m.isInRevitalizationZone
        ? `<p class="partner-map-popup__zone">Strefa rewitalizacji</p>`
        : "";
      const desc = m.description?.trim()
        ? `<p class="partner-map-popup__desc">${escapeHtml(m.description.trim())}</p>`
        : "";

      L.marker([m.lat, m.lng], { icon })
        .bindPopup(
          `
          <div class="partner-map-popup">
            <p class="partner-map-popup__title">${escapeHtml(m.name)}</p>
            ${zone}
            ${desc}
          </div>
        `,
          { maxWidth: 260, className: "partner-map-popup-root" },
        )
        .addTo(layerGroup);
    }

    if (validMarkers.length === 0) {
      map.setView(WOLOMIN, 12);
    } else if (validMarkers.length === 1) {
      map.setView([validMarkers[0].lat, validMarkers[0].lng], 14);
    } else {
      const bounds = L.latLngBounds(
        validMarkers.map((m) => [m.lat, m.lng] as [number, number]),
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
      } else {
        map.setView(WOLOMIN, 12);
      }
    }
  }, [markers]);

  return <div ref={containerRef} className="h-full w-full" />;
}
