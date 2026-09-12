import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import {
  CheckCircleIcon,
  CoinIcon,
  ScanIcon,
  TagIcon,
} from "@/components/icons";
import { getDashboardData } from "@/lib/auth";
import {
  formatCoins,
  formatDate,
  formatNumber,
  formatPhone,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Panel klienta",
};

function StatusBadge({
  value,
  yes = "Tak",
  no = "Nie",
}: {
  value: boolean;
  yes?: string;
  no?: string;
}) {
  return (
    <span
      className={`badge ${value ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}
    >
      {value ? yes : no}
    </span>
  );
}

export default async function DashboardPage() {
  const { user, transactions, coinAdditions } = await getDashboardData();

  return (
    <div>
      <PageHeader
        title={`Cześć, ${user.name}!`}
        subtitle="Twoje saldo, dane konta i historia aktywności."
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-coin-300/30 blur-2xl" />
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              <CoinIcon className="h-5 w-5 text-coin-600" />
              Saldo monet
            </div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums text-brand-900">
              {formatNumber(user.coins)}{" "}
              <span className="text-lg font-bold text-coin-600">WM</span>
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              <ScanIcon className="h-5 w-5 text-brand-600" />
              Transakcje
            </div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums text-brand-900">
              {formatNumber(transactions.length)}
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              <TagIcon className="h-5 w-5 text-brand-600" />
              Doładowania monet
            </div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums text-brand-900">
              {formatNumber(coinAdditions.length)}
            </p>
          </div>
        </div>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-brand-900">Dane konta</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Imię i nazwisko" value={`${user.name} ${user.surname}`} />
            <InfoItem label="E-mail" value={user.email} />
            <InfoItem
              label="Telefon"
              value={
                user.phoneNumber != null
                  ? formatPhone(user.phoneNumber)
                  : "—"
              }
            />
            <InfoItem
              label="Telefon zweryfikowany"
              value={<StatusBadge value={user.isPhoneVerified} />}
            />
            <InfoItem
              label="Typ konta"
              value={user.isOwner ? "Właściciel" : "Klient"}
            />
            <InfoItem label="ID użytkownika" value={String(user.id)} />
            <InfoItem label="Cognito username" value={user.cognitoUsername} />
            <InfoItem label="Cognito sub" value={user.cognitoSub} />
            <InfoItem
              label="Konto usunięte"
              value={<StatusBadge value={user.isDeleted} />}
            />
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-brand-900">Transakcje</h2>
          {transactions.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Brak transakcji. Zrób zakupy u partnera programu, aby zobaczyć
              historię.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-[var(--ink-soft)]">
                    <th className="py-2 pr-3 font-semibold">Data</th>
                    <th className="py-2 pr-3 font-semibold">Usługa</th>
                    <th className="py-2 pr-3 font-semibold">Partner</th>
                    <th className="py-2 pr-3 font-semibold">Koszt</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-black/5">
                      <td className="py-3 pr-3">{formatDate(tx.date)}</td>
                      <td className="py-3 pr-3 font-medium text-brand-900">
                        {tx.serviceName}
                      </td>
                      <td className="py-3 pr-3 text-[var(--ink-soft)]">
                        {tx.providerName}
                      </td>
                      <td className="py-3 pr-3 font-semibold tabular-nums text-coin-700">
                        {formatCoins(tx.coinCost)}
                      </td>
                      <td className="py-3">
                        <StatusBadge
                          value={tx.isConsumed}
                          yes="Zrealizowana"
                          no={tx.isValid ? "Ważna" : "Nieważna"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-brand-900">
            Doładowania monet
          </h2>
          {coinAdditions.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Brak doładowań. Monety pojawią się po zakupach u partnerów.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {coinAdditions.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                    <CheckCircleIcon className="h-4 w-4 text-brand-600" />
                    {formatDate(entry.date)} · partner #{entry.companyId}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-brand-600">
                    +{formatCoins(entry.coinAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/30 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
        {label}
      </dt>
      <dd className="mt-1 break-all text-sm font-semibold text-brand-900">
        {value}
      </dd>
    </div>
  );
}
