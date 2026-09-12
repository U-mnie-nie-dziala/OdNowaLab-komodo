import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CoinIcon,
  TagIcon,
} from "@/components/icons";
import { requireUser } from "@/lib/auth";
import {
  DISCOUNT_TIERS,
  EARN_RATE,
  formatCoins,
  formatNumber,
  formatPln,
  plnToCoins,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Zniżki",
};

export default async function DiscountsPage() {
  const user = await requireUser();

  return (
    <div>
      <PageHeader
        title="Zniżki za monety"
        subtitle="Wymieniaj Monety Wołomińskie na zniżki u partnerów w strefie rewitalizacji."
      />

      <div className="space-y-6">
        <div className="card relative overflow-hidden border-2 border-[var(--ink)] bg-lav-200 p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 bg-brand-600/15" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                Twoje saldo
              </p>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums text-brand-600">
                {formatNumber(user.coins)}{" "}
                <span className="text-xl font-bold text-[var(--ink)]">WM</span>
              </p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Za każde {formatPln(1)} zakupów dostajesz {EARN_RATE} WM ·
                przykładowo {formatPln(50)} ={" "}
                {formatCoins(plnToCoins(50))}.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
              <CoinIcon className="h-4 w-4" /> Monety Wołomińskie
            </span>
          </div>
        </div>

        <div className="card border-2 border-[var(--ink)] bg-white p-5">
          <div className="flex items-start gap-3">
            <CoinIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-brand-600">
                Zniżki są wspólne dla całego programu
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Te cztery progi obowiązują u partnerów w strefie rewitalizacji.
                Podaj numer telefonu przy kasie — kasjer zrealizuje zniżkę z
                Twojego salda.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-brand-600">Progi zniżek</h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Ceny wyrażone w Monetach Wołomińskich (WM).
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {DISCOUNT_TIERS.map((tier) => {
              const ready = user.coins >= tier.cost;
              const missing = Math.max(0, tier.cost - user.coins);
              return (
                <div
                  key={tier.pct}
                  className="flex items-center gap-4 border-2 border-[var(--ink)]/15 p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand-600 text-white">
                    <TagIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-lg font-bold text-brand-600">
                        Zniżka {tier.pct}%
                      </p>
                      {ready ? (
                        <span className="badge border-brand-600 text-brand-700">
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Dostępna
                        </span>
                      ) : (
                        <span className="badge">
                          Brakuje {formatCoins(missing)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[var(--ink)]">
                      {formatCoins(tier.cost)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-2 border-[var(--ink)] bg-lav-100 p-6 text-center sm:text-left">
          <p className="text-sm text-[var(--ink-soft)]">
            Zniżki realizujesz wyłącznie u partnerów programu. Nie wymieniasz
            monet samodzielnie w aplikacji — robi to kasjer w sklepie.
          </p>
          <Link href="/dashboard" className="btn-outline mt-4 inline-flex">
            Wróć do panelu <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
