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
import type { TransactionResponseDto, UserResponseDto } from "@/lib/types";
import { ensureCompanyDiscountTiers, type DiscountTier } from "@/lib/discounts";
import { PageHeader } from "@/components/PageHeader";
import {
  CoinIcon,
  ScanIcon,
  TagIcon,
  UserIcon,
  CheckCircleIcon,
  AlertIcon,
  ArrowRightIcon,
  CloseIcon,
} from "@/components/icons";
import {
  EARN_RATE,
  formatCoins,
  formatPhone,
  formatNumber,
  formatDate,
  plnToCoins,
  todayIso,
  discountPctFromName,
} from "@/lib/format";

type Mode = "earn" | "redeem" | "use";

export default function CashierPage() {
  const { session } = useAuth();
  const toast = useToast();
  const companyId = session!.companyId;

  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [tiers, setTiers] = useState<DiscountTier[]>([]);
  const [vouchers, setVouchers] = useState<TransactionResponseDto[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("earn");
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [consumingId, setConsumingId] = useState<number | null>(null);
  const [pendingConsume, setPendingConsume] = useState<TransactionResponseDto | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Błąd wczytywania klientów.");
    }
  }, []);

  useEffect(() => {
    loadUsers();
    ensureCompanyDiscountTiers(companyId)
      .then(setTiers)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Błąd wczytywania zniżek.")
      );
  }, [loadUsers, companyId]);

  const customer = useMemo(() => {
    const n = Number(query.replace(/\s/g, ""));
    if (!query.trim() || Number.isNaN(n)) return null;
    return users.find((u) => u.id === n || u.phoneNumber === n) ?? null;
  }, [query, users]);

  const notFound = query.trim().length > 0 && !customer;

  const loadVouchers = useCallback(async (userId: number) => {
    setVouchersLoading(true);
    try {
      const list = await transactionsApi.byUserAndProvider(userId, companyId);
      setVouchers(
        [...list].sort((a, b) => {
          const aUsed = a.isConsumed || !a.isValid ? 1 : 0;
          const bUsed = b.isConsumed || !b.isValid ? 1 : 0;
          if (aUsed !== bUsed) return aUsed - bUsed;
          return b.id - a.id;
        })
      );
    } catch (err) {
      setVouchers([]);
      toast.error(
        "Nie udało się wczytać bonów",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setVouchersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (customer && mode === "use") {
      loadVouchers(customer.id);
    } else {
      setVouchers([]);
      setPendingConsume(null);
    }
  }, [customer, mode, loadVouchers]);

  const activeVouchers = useMemo(
    () => vouchers.filter((t) => t.isValid && !t.isConsumed),
    [vouchers]
  );
  const usedVouchers = useMemo(
    () => vouchers.filter((t) => t.isConsumed || !t.isValid),
    [vouchers]
  );

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
        `Bon ${selected.pct}% wykupiony`,
        `Pobrano ${formatCoins(selected.cost)} – pozostało: ${formatCoins(updated.coins)}. Bon czeka na użycie.`
      );
      setSelectedTier(null);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : undefined;
      toast.error("Nie udało się wykupić bonu", msg);
    } finally {
      setBusy(false);
    }
  }

  async function confirmConsume() {
    const tx = pendingConsume;
    if (!tx) return;
    setConsumingId(tx.id);
    try {
      const updated = await transactionsApi.consume(tx.id, companyId);
      setVouchers((list) =>
        [...list.map((v) => (v.id === updated.id ? updated : v))].sort((a, b) => {
          const aUsed = a.isConsumed || !a.isValid ? 1 : 0;
          const bUsed = b.isConsumed || !b.isValid ? 1 : 0;
          if (aUsed !== bUsed) return aUsed - bUsed;
          return b.id - a.id;
        })
      );
      const pct = discountPctFromName(tx.serviceName);
      toast.success(
        "Bon oznaczony jako zużyty",
        pct != null
          ? `${tx.serviceName} – zniżka ${pct}% wykorzystana`
          : `${tx.serviceName} wykorzystany`
      );
      setPendingConsume(null);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : undefined;
      toast.error("Nie udało się zużyć bonu", msg);
    } finally {
      setConsumingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Kasa"
        subtitle="Naliczaj monety, wykupuj bony zniżkowe i oznaczaj je jako zużyte."
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
          <input
            id="cust"
            inputMode="numeric"
            className={`input ${notFound ? "input-error" : ""}`}
            placeholder="np. 601 111 222 lub 4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

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
              <CoinIcon className="h-5 w-5" /> Nalicz
            </TabBtn>
            <TabBtn active={mode === "redeem"} onClick={() => setMode("redeem")}>
              <TagIcon className="h-5 w-5" /> Wymień na zniżkę
            </TabBtn>
            <TabBtn active={mode === "use"} onClick={() => setMode("use")}>
              <CheckCircleIcon className="h-5 w-5" /> Użyj bon
            </TabBtn>
          </div>

          {mode === "earn" && (
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
          )}

          {mode === "redeem" && (
            <div className="mt-6">
              <label className="label">Wybierz bon zniżkowy do wykupu</label>
              <p className="mb-3 text-xs text-slate-400">
                Bon jest ważny tylko w Twoim sklepie. Po wykupie oznaczysz go jako zużyty w zakładce „Użyj bon”.
              </p>

              {customer && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 text-sm">
                  <span className="text-[var(--ink-soft)]">Saldo klienta</span>
                  <span className="flex items-center gap-1.5 font-extrabold text-brand-900">
                    <CoinIcon className="h-4 w-4 text-coin-500" />
                    {formatCoins(customer.coins)}
                  </span>
                </div>
              )}

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
                        type="button"
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
                  <Row label="Koszt bonu" value={`− ${formatCoins(selected.cost)}`} />
                  <div className="my-2 border-t border-slate-200" />
                  <Row
                    label="Saldo po wykupie"
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
                {busy ? "Przetwarzanie…" : (<>Kup bon {selected ? `${selected.pct}%` : ""} <ArrowRightIcon className="h-5 w-5" /></>)}
              </button>
              {!customer && <HintUnderButton />}
            </div>
          )}

          {mode === "use" && (
            <div className="mt-6">
              <label className="label">Bony klienta</label>
              <p className="mb-3 text-xs text-slate-400">
                Aktywne i zużyte bony do Twojego sklepu. Przed zużyciem potwierdzisz operację.
              </p>

              {!customer ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  Najpierw rozpoznaj klienta po lewej stronie.
                </div>
              ) : vouchersLoading ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  Wczytywanie bonów…
                </div>
              ) : vouchers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  Ten klient nie ma bonów do Twojego sklepu.
                </div>
              ) : (
                <div className="space-y-5">
                  {activeVouchers.length > 0 && (
                    <VoucherSection title={`Aktywne (${activeVouchers.length})`}>
                      {activeVouchers.map((tx) => (
                        <VoucherCard
                          key={tx.id}
                          tx={tx}
                          onConsume={() => setPendingConsume(tx)}
                          disabled={consumingId != null}
                        />
                      ))}
                    </VoucherSection>
                  )}
                  {usedVouchers.length > 0 && (
                    <VoucherSection title={`Zużyte (${usedVouchers.length})`}>
                      {usedVouchers.map((tx) => (
                        <VoucherCard key={tx.id} tx={tx} />
                      ))}
                    </VoucherSection>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {pendingConsume && (
        <ConfirmConsumeModal
          tx={pendingConsume}
          busy={consumingId === pendingConsume.id}
          onCancel={() => {
            if (consumingId == null) setPendingConsume(null);
          }}
          onConfirm={confirmConsume}
        />
      )}
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
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:gap-2 sm:text-sm ${
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

function VoucherSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</ul>
    </div>
  );
}

function VoucherCard({
  tx,
  onConsume,
  disabled,
}: {
  tx: TransactionResponseDto;
  onConsume?: () => void;
  disabled?: boolean;
}) {
  const pct = discountPctFromName(tx.serviceName);
  const used = tx.isConsumed || !tx.isValid;

  return (
    <li
      className={`relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl border p-3 ${
        used
          ? "border-slate-200 bg-slate-50 opacity-80"
          : "border-brand-200 bg-gradient-to-b from-brand-50 to-white shadow-sm"
      }`}
    >
      {used ? (
        <span className="absolute right-2 top-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          Zużyty
        </span>
      ) : (
        <span className="absolute right-2 top-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
          Aktywny
        </span>
      )}

      <div className="mt-5 flex flex-1 flex-col items-center justify-center text-center">
        <p
          className={`text-3xl font-extrabold tabular-nums ${
            used ? "text-slate-400 line-through" : "text-brand-800"
          }`}
        >
          {pct != null ? `${pct}%` : "—"}
        </p>
        <p className={`mt-1 text-xs font-semibold ${used ? "text-slate-400" : "text-brand-900"}`}>
          {tx.serviceName}
        </p>
        <p className="mt-2 text-[11px] text-slate-400">{formatDate(tx.date)}</p>
        <p className={`mt-1 text-xs font-semibold ${used ? "text-slate-400" : "text-coin-600"}`}>
          {formatCoins(tx.coinCost)}
        </p>
      </div>

      {onConsume && !used ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onConsume}
          className="btn-primary mt-auto w-full py-2 text-xs"
        >
          Zużyj
        </button>
      ) : (
        <div className="mt-auto flex items-center justify-center gap-1 py-2 text-[11px] font-medium text-slate-400">
          <CheckCircleIcon className="h-3.5 w-3.5" /> Wykorzystany
        </div>
      )}
    </li>
  );
}

function ConfirmConsumeModal({
  tx,
  busy,
  onCancel,
  onConfirm,
}: {
  tx: TransactionResponseDto;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const pct = discountPctFromName(tx.serviceName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-consume-title"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="confirm-consume-title" className="text-lg font-bold text-brand-900">
              Zużyć bon?
            </h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Tej operacji nie da się cofnąć. Bon zostanie oznaczony jako wykorzystany.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost -mr-1 -mt-1 p-2"
            onClick={onCancel}
            disabled={busy}
            aria-label="Zamknij"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm">
          <p className="font-extrabold text-brand-900">
            {pct != null ? `Zniżka ${pct}%` : tx.serviceName}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
            {tx.serviceName} · {formatCoins(tx.coinCost)} · {formatDate(tx.date)}
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="btn-outline flex-1"
            onClick={onCancel}
            disabled={busy}
          >
            Anuluj
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Przetwarzanie…" : "Tak, zużyj"}
          </button>
        </div>
      </div>
    </div>
  );
}
