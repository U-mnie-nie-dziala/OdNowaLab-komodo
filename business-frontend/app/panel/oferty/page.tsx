"use client";

import { PageHeader } from "@/components/PageHeader";
import { DISCOUNT_TIERS, EARN_RATE, formatCoins } from "@/lib/format";
import { TagIcon, CoinIcon } from "@/components/icons";

export default function DiscountsPage() {
  return (
    <div>
      <PageHeader
        title="Zniżki w programie"
        subtitle="Progi zniżek wspólne dla wszystkich sklepów w Wołomińskim Programie Partnerskim."
      />

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
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand-600 text-white">
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
  );
}
