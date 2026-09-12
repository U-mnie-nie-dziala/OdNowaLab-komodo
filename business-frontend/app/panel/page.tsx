"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { coinAdditionsApi, transactionsApi, usersApi } from "@/lib/api";
import type {
  CoinAdditionResponseDto,
  TransactionResponseDto,
  UserResponseDto,
} from "@/lib/types";
import { ensureCompanyDiscountTiers, type DiscountTier } from "@/lib/discounts";
import { ShareBar } from "@/components/Charts";
import { PageHeader } from "@/components/PageHeader";
import {
  CoinIcon,
  TrendUpIcon,
  ScanIcon,
  UsersIcon,
  TagIcon,
  CheckCircleIcon,
  AlertIcon,
} from "@/components/icons";
import {
  EARN_RATE,
  discountPctFromName,
  formatCoins,
  formatDate,
  formatNumber,
  formatPln,
} from "@/lib/format";

export default function StatsPage() {
  const { session } = useAuth();
  const companyId = session!.companyId;

  const [additions, setAdditions] = useState<CoinAdditionResponseDto[]>([]);
  const [tierStats, setTierStats] = useState<{ tier: DiscountTier; count: number }[]>([]);
  const [vouchers, setVouchers] = useState<TransactionResponseDto[]>([]);
  const [users, setUsers] = useState<Record<number, UserResponseDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adds, allUsers, tiers] = await Promise.all([
        coinAdditionsApi.byCompany(companyId),
        usersApi.list(),
        ensureCompanyDiscountTiers(companyId),
      ]);

      const companyTx = await transactionsApi.byProvider(companyId);
      const tStats = tiers.map((t) => ({
        tier: t,
        count: companyTx.filter((tx) => tx.serviceId === t.serviceId).length,
      }));

      setAdditions(adds);
      setUsers(Object.fromEntries(allUsers.map((u) => [u.id, u])));
      setTierStats(tStats);
      setVouchers(companyTx);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać danych.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const coinsIssued = additions.reduce((a, c) => a + c.coinAmount, 0);
    const uniqueCustomers = new Set(additions.map((a) => a.userId)).size;
    return {
      coinsIssued,
      uniqueCustomers,
      turnover: coinsIssued / EARN_RATE,
      earnCount: additions.length,
    };
  }, [additions]);

  const totalRedemptions = tierStats.reduce((a, t) => a + t.count, 0);

  const feed = useMemo(
    () =>
      [...additions]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 8),
    [additions]
  );

  const usedVouchers = useMemo(
    () =>
      vouchers
        .filter((v) => v.isConsumed)
        .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : b.id - a.id))
        .slice(0, 8),
    [vouchers]
  );

  function nameOf(userId: number) {
    const u = users[userId];
    return u ? `${u.name} ${u.surname}` : `Klient #${userId}`;
  }

  return (
    <div>
      <PageHeader title="Statystyki sklepu" subtitle={session!.companyName} />

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={load} className="font-semibold underline">Ponów</button>
        </div>
      )}

      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<CoinIcon className="h-5 w-5" />}
              tone="coin"
              label="Naliczone monety"
              value={formatCoins(stats.coinsIssued)}
              sub="klientom w Twoim sklepie"
            />
            <StatCard
              icon={<TrendUpIcon className="h-5 w-5" />}
              tone="brand"
              label="Szacowany obrót"
              value={formatPln(stats.turnover)}
              sub={`przy ${EARN_RATE} WM za 1 zł`}
            />
            <StatCard
              icon={<ScanIcon className="h-5 w-5" />}
              tone="brand"
              label="Naliczenia"
              value={formatNumber(stats.earnCount)}
              sub="operacji przy kasie"
            />
            <StatCard
              icon={<UsersIcon className="h-5 w-5" />}
              tone="brand"
              label="Klienci"
              value={formatNumber(stats.uniqueCustomers)}
              sub="nagrodzonych monetami"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-900">Popularność zniżek</h2>
              <p className="text-sm text-[var(--ink-soft)]">
                Wymiany monet na zniżki w całym programie (progi są wspólne).
              </p>
              <div className="mt-5 space-y-4">
                {totalRedemptions === 0 && (
                  <EmptyHint text="Nie zrealizowano jeszcze żadnej wymiany na zniżkę." />
                )}
                {totalRedemptions > 0 &&
                  tierStats.map(({ tier, count }) => (
                    <ShareBar
                      key={tier.serviceId}
                      label={`Zniżka ${tier.pct}% · ${formatCoins(tier.cost)}`}
                      value={count}
                      total={totalRedemptions}
                      colorClass={tier.pct >= 50 ? "bg-coin-500" : "bg-brand-500"}
                    />
                  ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-900">Ostatnie naliczenia</h2>
              <p className="text-sm text-[var(--ink-soft)]">Najnowsze operacje w Twoim sklepie.</p>
              <div className="mt-4 divide-y divide-slate-100">
                {feed.length === 0 && <EmptyHint text="Brak operacji do wyświetlenia." />}
                {feed.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <CoinIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">{nameOf(a.userId)}</p>
                      <p className="truncate text-xs text-[var(--ink-soft)]">
                        Naliczenie monet · {formatDate(a.date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-brand-600">
                      +{formatNumber(a.coinAmount)} WM
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-brand-900">Ostatnio wykorzystane bony</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Bony zniżkowe zrealizowane (zużyte) w Twoim sklepie.
            </p>
            <div className="mt-4 divide-y divide-slate-100">
              {usedVouchers.length === 0 && (
                <EmptyHint text="Żaden bon nie został jeszcze zużyty w Twoim sklepie." />
              )}
              {usedVouchers.map((v) => {
                const pct = discountPctFromName(v.serviceName);
                return (
                  <div key={v.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-600 text-white">
                      <TagIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {nameOf(v.userId)}
                      </p>
                      <p className="truncate text-xs text-[var(--ink-soft)]">
                        {pct != null ? `Zniżka ${pct}%` : v.serviceName} · {formatDate(v.date)}
                      </p>
                    </div>
                    <span className="badge shrink-0 gap-1 border-brand-600 text-brand-700">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Zużyty
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({
  icon, label, value, sub, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "brand" | "coin";
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center ${
            tone === "coin" ? "bg-brand-600 text-white" : "bg-brand-600 text-white"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-brand-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">{text}</p>;
}

function SkeletonStats() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse bg-slate-100/60" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card h-64 animate-pulse bg-slate-100/60" />
        <div className="card h-64 animate-pulse bg-slate-100/60" />
      </div>
    </div>
  );
}
