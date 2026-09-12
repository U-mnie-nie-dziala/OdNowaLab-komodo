import type { Metadata } from "next";
import Link from "next/link";

import { ActivityBars, type DayPoint } from "@/components/Charts";
import { PageHeader } from "@/components/PageHeader";
import {
  ArrowRightIcon,
  CoinIcon,
  TagIcon,
  TrendUpIcon,
  ScanIcon,
} from "@/components/icons";
import { getDashboardData } from "@/lib/auth";
import {
  DISCOUNT_TIERS,
  EARN_RATE,
  formatCoins,
  formatDate,
  formatNumber,
  formatPhone,
  formatPln,
} from "@/lib/format";
import type { CoinAddition, Transaction } from "@/lib/types";

export const metadata: Metadata = {
  title: "Panel klienta",
};

function lastNDays(n: number): string[] {
  const arr: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const mm = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    arr.push(`${x.getFullYear()}-${mm}-${dd}`);
  }
  return arr;
}

function buildChartData(
  additions: CoinAddition[],
  transactions: Transaction[],
): DayPoint[] {
  const days = lastNDays(14);
  const earnedBy = new Map<string, number>();
  const spentBy = new Map<string, number>();

  additions.forEach((a) => {
    earnedBy.set(a.date, (earnedBy.get(a.date) ?? 0) + a.coinAmount);
  });
  transactions.forEach((t) => {
    spentBy.set(t.date, (spentBy.get(t.date) ?? 0) + t.coinCost);
  });

  return days.map((d) => ({
    label: `${d.slice(8, 10)}.${d.slice(5, 7)}`,
    earned: earnedBy.get(d) ?? 0,
    spent: spentBy.get(d) ?? 0,
  }));
}

export default async function DashboardPage() {
  const { user, transactions, coinAdditions } = await getDashboardData();

  const earnedTotal = coinAdditions.reduce((a, c) => a + c.coinAmount, 0);
  const spentTotal = transactions.reduce((a, t) => a + t.coinCost, 0);
  const chartData = buildChartData(coinAdditions, transactions);

  const feed = [
    ...coinAdditions.map((a) => ({
      id: `add-${a.id}`,
      date: a.date,
      kind: "earn" as const,
      label: `Doładowanie · partner #${a.companyId}`,
      amount: a.coinAmount,
    })),
    ...transactions.map((t) => ({
      id: `tx-${t.id}`,
      date: t.date,
      kind: "spend" as const,
                      label: `${t.serviceName}${t.providerName ? ` · ${t.providerName}` : ""}`,
      amount: t.coinCost,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const recentTx = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  const affordableTiers = DISCOUNT_TIERS.filter((t) => user.coins >= t.cost);
  const nextTier = DISCOUNT_TIERS.find((t) => user.coins < t.cost);

  return (
    <div>
      <PageHeader
        title={`Cześć, ${user.name}!`}
        subtitle="Twoje saldo, aktywność i dostępne zniżki w Wołomińskim Programie Partnerskim."
      />

      <div className="space-y-6">
        <div className="relative overflow-hidden border-2 border-[var(--ink)] bg-brand-600 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 bg-lav-200/20" />
          <div className="pointer-events-none absolute -bottom-8 -left-6 h-32 w-32 bg-brand-900/35" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-100/90">
                Saldo monet
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-4xl font-bold tabular-nums sm:text-5xl">
                  {formatNumber(user.coins)}
                </span>
                <span className="mb-1 font-bold text-lav-200">WM</span>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-brand-50">
                <CoinIcon className="h-4 w-4" />
                {affordableTiers.length > 0
                  ? `Możesz wymienić na ${affordableTiers.length} z ${DISCOUNT_TIERS.length} progów zniżek`
                  : nextTier
                    ? `Do zniżki ${nextTier.pct}% brakuje ${formatCoins(nextTier.cost - user.coins)}`
                    : `+${EARN_RATE} WM za każdą wydaną złotówkę`}
              </p>
            </div>
            <Link href="/dashboard/znizki" className="btn-coin shrink-0">
              Zobacz zniżki <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CoinIcon className="h-5 w-5" />}
            tone="coin"
            label="Saldo monet"
            value={formatCoins(user.coins)}
            sub="aktualny stan konta"
          />
          <StatCard
            icon={<TrendUpIcon className="h-5 w-5" />}
            tone="brand"
            label="Zebrane łącznie"
            value={formatCoins(earnedTotal)}
            sub={`ok. ${formatPln(earnedTotal / EARN_RATE)} zakupów`}
          />
          <StatCard
            icon={<TagIcon className="h-5 w-5" />}
            tone="brand"
            label="Wymienione"
            value={formatCoins(spentTotal)}
            sub={`${formatNumber(transactions.length)} transakcji`}
          />
          <StatCard
            icon={<ScanIcon className="h-5 w-5" />}
            tone="brand"
            label="Dostępne zniżki"
            value={formatNumber(affordableTiers.length)}
            sub={`z ${DISCOUNT_TIERS.length} progów`}
          />
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-brand-600">
                Aktywność (ostatnie 14 dni)
              </h2>
              <p className="text-sm text-[var(--ink-soft)]">
                Monety zebrane za zakupy i wymienione na zniżki.
              </p>
            </div>
            <Link
              href="/dashboard/znizki"
              className="btn-outline hidden sm:inline-flex"
            >
              <TagIcon className="h-4 w-4" /> Zniżki
            </Link>
          </div>
          <ActivityBars
            data={chartData}
            earnedLabel="Zebrane monety"
            spentLabel="Wymienione monety"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-brand-600">Progi zniżek</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Na podstawie Twojego salda ({formatCoins(user.coins)}).
            </p>
            <div className="mt-5 space-y-3">
              {DISCOUNT_TIERS.map((tier) => {
                const ready = user.coins >= tier.cost;
                const progress = Math.min(
                  100,
                  Math.round((user.coins / tier.cost) * 100),
                );
                return (
                  <div key={tier.pct}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--ink)]">
                        Zniżka {tier.pct}% · {formatCoins(tier.cost)}
                      </span>
                      <span
                        className={`badge ${ready ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {ready ? "Dostępna" : `${progress}%`}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ready ? "bg-brand-500" : "bg-coin-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-brand-600">
              Ostatnia aktywność
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Najnowsze doładowania i wymiany.
            </p>
            <div className="mt-4 divide-y divide-slate-100">
              {feed.length === 0 && (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                  Brak aktywności. Zrób zakupy u partnera programu.
                </p>
              )}
              {feed.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                      item.kind === "earn"
                        ? "bg-brand-600 text-white"
                        : "bg-lav-200 text-brand-700"
                    }`}
                  >
                    {item.kind === "earn" ? (
                      <CoinIcon className="h-4 w-4" />
                    ) : (
                      <TagIcon className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--ink)]">
                      {item.label}
                    </p>
                    <p className="truncate text-xs text-[var(--ink-soft)]">
                      {formatDate(item.date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      item.kind === "earn" ? "text-brand-600" : "text-coin-600"
                    }`}
                  >
                    {item.kind === "earn" ? "+" : "−"}
                    {formatNumber(item.amount)} WM
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-600">Twoje konto</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {user.name} {user.surname} · {user.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-brand-50 text-brand-700">
                {user.phoneNumber != null
                  ? formatPhone(user.phoneNumber)
                  : "Brak telefonu"}
              </span>
              <span
                className={`badge ${user.isPhoneVerified ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}
              >
                {user.isPhoneVerified
                  ? "Telefon zweryfikowany"
                  : "Telefon niezweryfikowany"}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-black/5 pt-5">
            <h3 className="text-sm font-bold text-brand-900">
              Ostatnie wymiany
            </h3>
            {recentTx.length === 0 ? (
              <p className="mt-3 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
                Brak wymian. Zrób zakupy u partnera, a potem skorzystaj ze zniżki.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {recentTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-900">
                        {tx.serviceName}
                      </p>
                      <p className="truncate text-xs text-[var(--ink-soft)]">
                        {formatDate(tx.date)}
                        {tx.providerName ? ` · ${tx.providerName}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-coin-700">
                        {formatCoins(tx.coinCost)}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {tx.isConsumed
                          ? "Zrealizowana"
                          : tx.isValid
                            ? "Ważna"
                            : "Nieważna"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "brand" | "coin";
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center bg-brand-600 text-white">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-brand-600">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}
