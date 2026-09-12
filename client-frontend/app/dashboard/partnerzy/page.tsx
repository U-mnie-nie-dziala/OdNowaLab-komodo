import type { Metadata } from "next";

import { PartnerCard } from "@/components/PartnerCard";
import { PartnersMapSlot } from "@/components/PartnersMapSlot";
import { PageHeader } from "@/components/PageHeader";
import { StoreIcon } from "@/components/icons";
import { listCompanies } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { toPartnerMapMarkers } from "@/lib/partners";
import { getSessionTokens } from "@/lib/session";
import type { Company } from "@/lib/types";

export const metadata: Metadata = {
  title: "Partnerzy",
};

export default async function PartnersPage() {
  await requireUser();
  const tokens = await getSessionTokens();

  let companies: Company[] = [];
  let loadError: string | null = null;

  try {
    companies = await listCompanies(tokens?.accessToken);
    companies = [...companies].sort((a, b) =>
      a.name.localeCompare(b.name, "pl"),
    );
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Nie udało się wczytać listy partnerów.";
  }

  const markers = toPartnerMapMarkers(companies);
  const inZone = companies.filter((c) => c.isInRevitalizationZone).length;

  return (
    <div>
      <PageHeader
        title="Partnerzy programu"
        subtitle="Lokalne sklepy i usługi, w których zbierasz i wymieniasz Monety Wołomińskie."
      />

      <div className="space-y-6">
        <PartnersMapSlot markers={markers} />

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 border-2 border-[var(--ink)] bg-white px-3 py-2 font-bold text-[var(--ink)]">
            <StoreIcon className="h-4 w-4 text-brand-600" />
            {companies.length}{" "}
            {companies.length === 1 ? "partner" : "partnerów"}
          </span>
          {inZone > 0 && (
            <span className="inline-flex items-center gap-2 border-2 border-[var(--ink)] bg-lav-100 px-3 py-2 font-bold text-brand-700">
              {inZone} w strefie rewitalizacji
            </span>
          )}
        </div>

        {loadError && (
          <div className="border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {!loadError && companies.length === 0 && (
          <div className="card px-4 py-12 text-center text-sm text-slate-400">
            Brak partnerów do wyświetlenia. Wróć tu później.
          </div>
        )}

        {companies.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {companies.map((company) => (
              <PartnerCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
