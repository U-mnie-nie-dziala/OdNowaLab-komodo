"use client";

import { useState } from "react";

import { MapPinIcon, SparklesIcon, StoreIcon } from "@/components/icons";
import {
  companyImageUrl,
  formatCoordinates,
  hasValidCoordinates,
} from "@/lib/partners";
import type { Company } from "@/lib/types";

export function PartnerCard({ company }: { company: Company }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(company.picture) && !imgError;
  const hasCoords = hasValidCoordinates(company);

  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] border-b border-[var(--ink)]/10 bg-lav-100">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- proxied backend image
          <img
            src={companyImageUrl(company.id)}
            alt={company.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-600">
            <StoreIcon className="h-12 w-12" />
          </div>
        )}
        {company.isInRevitalizationZone && (
          <span className="badge absolute left-3 top-3 bg-white">
            <SparklesIcon className="h-3.5 w-3.5" /> Strefa rewitalizacji
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-lg font-bold text-brand-600">
          {company.name}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--ink-soft)]">
          {company.description?.trim()
            ? company.description
            : "Partner Wołomińskiego Programu Partnerskiego."}
        </p>
        {hasCoords && (
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)]">
            <MapPinIcon className="h-3.5 w-3.5 text-brand-600" />
            {formatCoordinates(company.locationX, company.locationY)}
          </p>
        )}
      </div>
    </article>
  );
}
