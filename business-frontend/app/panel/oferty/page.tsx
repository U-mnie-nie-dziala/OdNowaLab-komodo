"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { companiesApi } from "@/lib/api";
import type { CompanyResponseDto } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { DISCOUNT_TIERS, EARN_RATE, formatCoins, formatNip } from "@/lib/format";
import {
  TagIcon,
  StoreIcon,
  MapPinIcon,
  SparklesIcon,
  CoinIcon,
  AlertIcon,
} from "@/components/icons";

export default function DiscountsPage() {
  const { session } = useAuth();
  const companyId = session!.companyId;

  const [company, setCompany] = useState<CompanyResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCompany(await companiesApi.get(companyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać danych sklepu.");
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Zniżki w programie"
        subtitle="Progi zniżek wspólne dla wszystkich sklepów w Wołomińskim Programie Partnerskim."
      />

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="card h-fit p-6">
          <div className="flex items-center gap-2 text-brand-700">
            <StoreIcon className="h-5 w-5" />
            <h2 className="text-lg font-bold text-brand-900">{session!.companyName}</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <Info label="NIP" value={session!.nip ? formatNip(session!.nip) : "–"} />
            <Info label="Adres" value={session!.address ?? "–"} icon={<MapPinIcon className="h-4 w-4" />} />
            {company?.description && <Info label="Opis" value={company.description} />}
          </dl>
          {company?.isInRevitalizationZone && (
            <span className="badge mt-4 bg-brand-100 text-brand-700">
              <SparklesIcon className="h-3.5 w-3.5" /> Strefa rewitalizacji
            </span>
          )}
        </div>

        <div className="space-y-6">
          <div className="card border-brand-100 bg-brand-50/50 p-5">
            <div className="flex items-start gap-3">
              <CoinIcon className="mt-0.5 h-5 w-5 shrink-0 text-coin-600" />
              <div>
                <p className="font-semibold text-brand-900">
                  Zniżki są wspólne dla całego programu
                </p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  Te cztery progi są takie same dla wszystkich sklepów i usługodawców
                  i obowiązują na <strong>każdy artykuł oraz usługę</strong> Twojego sklepu.
                  Klienci wymieniają na nie zebrane Monety Wołomińskie
                  (naliczane w tempie {EARN_RATE} WM za 1 zł zakupów).
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-brand-900">Progi zniżek</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Ceny wyrażone w Monetach Wołomińskich (WM).
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {DISCOUNT_TIERS.map((t) => (
                <div
                  key={t.pct}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-brand-700"
                    style={{ backgroundColor: "#fdf0d5" }}
                  >
                    <TagIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-extrabold text-brand-900">Zniżka {t.pct}%</p>
                    <p className="text-sm font-semibold text-coin-600">{formatCoins(t.cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[var(--ink-soft)]">{label}</dt>
      <dd className="flex items-center gap-1.5 text-right font-medium text-[var(--ink)]">
        {icon && <span className="text-brand-500">{icon}</span>}
        <span className="break-words">{value}</span>
      </dd>
    </div>
  );
}
