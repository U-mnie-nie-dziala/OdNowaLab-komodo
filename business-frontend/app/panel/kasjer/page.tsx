"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import {
  coinAdditionsApi,
  transactionsApi,
  usersApi,
  ApiError,
} from "@/lib/api";
import type { UserResponseDto } from "@/lib/types";
import { ensureGlobalDiscountTiers, type DiscountTier } from "@/lib/discounts";
import { PageHeader } from "@/components/PageHeader";
import {
  CoinIcon,
  ScanIcon,
  TagIcon,
  UserIcon,
  CheckCircleIcon,
  AlertIcon,
  PhoneIcon,
  ArrowRightIcon,
} from "@/components/icons";
import {
  EARN_RATE,
  formatCoins,
  formatPhone,
  formatNumber,
  plnToCoins,
  todayIso,
} from "@/lib/format";

type Mode = "earn" | "redeem";

export default function CashierPage() {
  const { session } = useAuth();
  const toast = useToast();
  const companyId = session!.companyId;

  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [tiers, setTiers] = useState<DiscountTier[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("earn");
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Błąd wczytywania klientów.");
    }
  }, []);

  useEffect(() => {
    loadUsers();
    ensureGlobalDiscountTiers()
      .then(setTiers)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Błąd wczytywania zniżek.")
      );
  }, [loadUsers]);

  const customer = useMemo(() => {
    const n = Number(query.replace(/\s/g, ""));
    if (!query.trim() || Number.isNaN(n)) return null;
    return users.find((u) => u.id === n || u.phoneNumber === n) ?? null;
  }, [query, users]);

  const notFound = query.trim().length > 0 && !customer;

  const coinsToEarn = useMemo(() => {
    const v = Number(amount.replace(",", "."));
    return v > 0 ? plnToCoins(v) : 0;
  }, [amount]);

  const selected = tiers.find((t) => t.serviceId === selectedTier) ?? null;
  const canRedeem = customer && selected && customer.coins >= selected.cost;

  async function submitEarn() {
    if (!customer || coinsToEarn <= 0) return;
    setBusy(true);
    try {
      await coinAdditionsApi.create({
        userId: customer.id,
        companyId,
        coinAmount: coinsToEarn,
        date: todayIso(),
      });
      const updated = await usersApi.get(customer.id);
      setUsers((us) => us.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(
        `Naliczono ${formatCoins(coinsToEarn)}`,
        `${customer.name} ${customer.surname} – nowe saldo: ${formatCoins(updated.coins)}`
      );
      setAmount("");
    } catch (err) {
      toast.error("Nie udało się naliczyć monet", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function submitRedeem() {
    if (!customer || !selected) return;
    setBusy(true);
    try {
      await transactionsApi.create({
        userId: customer.id,
        serviceId: selected.serviceId,
        date: todayIso(),
      });
      const updated = await usersApi.get(customer.id);
      setUsers((us) => us.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(
        `Zniżka ${selected.pct}% zrealizowana`,
        `Pobrano ${formatCoins(selected.cost)} – pozostało: ${formatCoins(updated.coins)}`
      );
      setSelectedTier(null);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : undefined;
      toast.error("Nie udało się zrealizować wymiany", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Kasjer"
        subtitle="Naliczaj monety za zakupy i realizuj wymianę na zniżki."
      />

      {loadError && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" /> {loadError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="card h-fit p-6">
          <h2 className="text-lg font-bold text-brand-900">Klient</h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Wpisz numer telefonu lub ID klienta.
          </p>

          <button type="button" className="btn-outline mt-4 w-full btn-lg">
            <ScanIcon className="h-5 w-5" />
            Skanuj kod QR
          </button>

          <div className="my-4 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-300">
            <span className="h-px flex-1 bg-slate-200" /> lub <span className="h-px flex-1 bg-slate-200" />
          </div>

          <label className="label" htmlFor="cust">Numer telefonu lub ID klienta</label>
          <div className="relative">
            <PhoneIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="cust"
              inputMode="numeric"
              className={`input pl-10 ${notFound ? "input-error" : ""}`}
              placeholder="np. 601 111 222 lub 4"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-4">
            {customer ? (
              <CustomerCard user={customer} />
            ) : notFound ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertIcon className="h-4 w-4 shrink-0" /> Nie znaleziono klienta o podanym numerze/ID.
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                Tu pojawią się dane rozpoznanego klienta.
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <TabBtn active={mode === "earn"} onClick={() => setMode("earn")}>
              <CoinIcon className="h-4 w-4" /> Nalicz monety
            </TabBtn>
            <TabBtn active={mode === "redeem"} onClick={() => setMode("redeem")}>
              <TagIcon className="h-4 w-4" /> Wymień na zniżkę
            </TabBtn>
          </div>

          {mode === "earn" ? (
            <div className="mt-6">
              <label className="label" htmlFor="amount">Wartość zakupów (zł)</label>
              <div className="relative">
                <input
                  id="amount"
                  inputMode="decimal"
                  className="input pr-12 text-lg font-semibold"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  zł
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white">
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand-100/80">Do naliczenia</p>
                  <p className="text-3xl font-extrabold tabular-nums">{formatNumber(coinsToEarn)} <span className="text-lg text-coin-300">WM</span></p>
                </div>
                <div className="text-right text-xs text-brand-100/80">
                  przelicznik<br />
                  <span className="text-sm font-semibold text-white">{EARN_RATE} WM / 1 zł</span>
                </div>
              </div>

              <button
                onClick={submitEarn}
                disabled={!customer || coinsToEarn <= 0 || busy}
                className="btn-primary mt-5 w-full btn-lg"
              >
                {busy ? "Przetwarzanie…" : (<>Nalicz {formatNumber(coinsToEarn)} WM <CheckCircleIcon className="h-5 w-5" /></>)}
              </button>
              {!customer && <HintUnderButton />}
            </div>
          ) : (
            <div className="mt-6">
              <label className="label">Wybierz zniżkę do wymiany</label>
              <p className="mb-3 text-xs text-slate-400">
                Progi wspólne dla wszystkich sklepów – obowiązują na każdy artykuł/usługę.
              </p>
              {tiers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                  Wczytywanie zniżek…
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {tiers.map((t) => {
                    const active = selectedTier === t.serviceId;
                    const affordable = !customer || customer.coins >= t.cost;
                    return (
                      <button
                        key={t.serviceId}
                        onClick={() => setSelectedTier(t.serviceId)}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                            : "border-slate-200 hover:border-brand-300"
                        } ${!affordable ? "opacity-50" : ""}`}
                      >
                        <span className="block text-base font-extrabold text-brand-900">
                          {t.pct}%
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-coin-600">
                          {formatCoins(t.cost)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selected && customer && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                  <Row label="Saldo klienta" value={formatCoins(customer.coins)} />
                  <Row label="Koszt wymiany" value={`− ${formatCoins(selected.cost)}`} />
                  <div className="my-2 border-t border-slate-200" />
                  <Row
                    label="Saldo po wymianie"
                    value={formatCoins(customer.coins - selected.cost)}
                    strong
                    danger={!canRedeem}
                  />
                  {!canRedeem && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Klient nie ma wystarczającej liczby monet.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={submitRedeem}
                disabled={!canRedeem || busy}
                className="btn-coin mt-5 w-full btn-lg"
              >
                {busy ? "Przetwarzanie…" : (<>Zrealizuj zniżkę <ArrowRightIcon className="h-5 w-5" /></>)}
              </button>
              {!customer && <HintUnderButton />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerCard({ user }: { user: UserResponseDto }) {
  return (
    <div className="animate-pop rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
          <UserIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-brand-900">
            {user.name} {user.surname}
          </p>
          <p className="text-xs text-[var(--ink-soft)]">
            tel. {formatPhone(user.phoneNumber)} · ID {user.id}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-4 py-3">
        <span className="text-sm text-[var(--ink-soft)]">Saldo monet</span>
        <span className="flex items-center gap-1.5 text-lg font-extrabold text-brand-900">
          <CoinIcon className="h-4 w-4 text-coin-500" /> {formatCoins(user.coins)}
        </span>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        active ? "bg-white text-brand-800 shadow-sm" : "text-slate-500 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, strong, danger }: { label: string; value: string; strong?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span className={`tabular-nums ${strong ? "text-base font-extrabold" : "font-semibold"} ${danger ? "text-red-600" : "text-brand-900"}`}>
        {value}
      </span>
    </div>
  );
}

function HintUnderButton() {
  return (
    <p className="mt-2 text-center text-xs text-slate-400">
      Najpierw rozpoznaj klienta po lewej stronie.
    </p>
  );
}
