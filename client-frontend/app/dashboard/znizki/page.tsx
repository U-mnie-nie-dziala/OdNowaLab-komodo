import type { Metadata } from "next";
import Link from "next/link";

import { RedeemForm } from "@/components/RedeemForm";
import { VoucherList } from "@/components/VoucherList";
import { PageHeader } from "@/components/PageHeader";
import { CoinIcon } from "@/components/icons";
import { listCompanies, getUserTransactions } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { isActiveVoucher, isUsedVoucher } from "@/lib/discounts";
import {
  EARN_RATE,
  formatCoins,
  formatNumber,
  formatPln,
  plnToCoins,
} from "@/lib/format";
import { getSessionTokens } from "@/lib/session";

export const metadata: Metadata = {
  title: "Zniżki",
};

export default async function DiscountsPage() {
  const user = await requireUser();
  const tokens = await getSessionTokens();
  const accessToken = tokens?.accessToken;

  const [partners, transactions] = await Promise.all([
    listCompanies(accessToken).catch(() => []),
    accessToken
      ? getUserTransactions(user.id, accessToken).catch(() => [])
      : Promise.resolve([]),
  ]);

  const sortedPartners = [...partners].sort((a, b) =>
    a.name.localeCompare(b.name, "pl"),
  );

  const vouchers = [...transactions].sort((a, b) => {
    const aUsed = isUsedVoucher(a) ? 1 : 0;
    const bUsed = isUsedVoucher(b) ? 1 : 0;
    if (aUsed !== bUsed) return aUsed - bUsed;
    return b.id - a.id;
  });

  const active = vouchers.filter(isActiveVoucher);
  const used = vouchers.filter(isUsedVoucher);

  return (
    <div>
      <PageHeader
        title="Zniżki za monety"
        subtitle="Wykup bon zniżkowy za Monety Wołomińskie i zrealizuj go u wybranego partnera."
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
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 border-2 border-[var(--ink)] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--ink)]">
                <CoinIcon className="h-4 w-4" /> {active.length} aktywnych
              </span>
              <Link
                href="#moje-bony"
                className="inline-flex items-center border-2 border-[var(--ink)] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-600 hover:bg-lav-100"
              >
                Moje bony
              </Link>
            </div>
          </div>
        </div>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-brand-600">Wykup bon</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Wybierz partnera i próg zniżki. Monety zostaną pobrane od razu — bon
            okazujesz przy kasie, a sklep oznacza go jako wykorzystany.
          </p>
          <div className="mt-5">
            <RedeemForm
              coins={user.coins}
              partners={sortedPartners.map((p) => ({
                id: p.id,
                name: p.name,
                isInRevitalizationZone: p.isInRevitalizationZone,
              }))}
            />
          </div>
        </section>

        <div id="moje-bony" className="scroll-mt-8 space-y-6">
          <VoucherList
            title="Aktywne bony"
            subtitle="Do okazania przy kasie partnera — jeszcze niewykorzystane."
            vouchers={active}
            empty="Nie masz aktywnych bonów. Wykup zniżkę powyżej."
          />
          <VoucherList
            title="Historia bonów"
            subtitle="Zrealizowane lub nieważne bony."
            vouchers={used}
            empty="Brak historii wymian."
            used
          />
        </div>
      </div>
    </div>
  );
}
