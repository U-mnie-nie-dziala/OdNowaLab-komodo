import {
  CheckCircleIcon,
  TagIcon,
} from "@/components/icons";
import { discountPctFromName, formatCoins, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

function VoucherRow({
  tx,
  used,
}: {
  tx: Transaction;
  used?: boolean;
}) {
  const pct = discountPctFromName(tx.serviceName);

  return (
    <div
      className={`flex items-center gap-3 border-2 px-4 py-3 ${
        used
          ? "border-[var(--ink)]/10 bg-slate-50 opacity-80"
          : "border-[var(--ink)] bg-white"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${
          used ? "bg-slate-300 text-slate-600" : "bg-brand-600 text-white"
        }`}
      >
        {used ? (
          <CheckCircleIcon className="h-4 w-4" />
        ) : (
          <TagIcon className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-brand-600">
          {pct != null ? `Bon −${pct}%` : tx.serviceName}
          {tx.providerName ? ` · ${tx.providerName}` : ""}
        </p>
        <p className="truncate text-xs text-[var(--ink-soft)]">
          {formatDate(tx.date)}
          {used
            ? tx.isConsumed
              ? " · zrealizowany"
              : " · nieważny"
            : " · do realizacji przy kasie"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums text-[var(--ink)]">
          {formatCoins(tx.coinCost)}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
          #{tx.id}
        </p>
      </div>
    </div>
  );
}

export function VoucherList({
  title,
  subtitle,
  vouchers,
  empty,
  used,
}: {
  title: string;
  subtitle: string;
  vouchers: Transaction[];
  empty: string;
  used?: boolean;
}) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold text-brand-600">{title}</h2>
      <p className="text-sm text-[var(--ink-soft)]">{subtitle}</p>
      <div className="mt-4 space-y-2">
        {vouchers.length === 0 ? (
          <p className="border-2 border-[var(--ink)]/10 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            {empty}
          </p>
        ) : (
          vouchers.map((tx) => <VoucherRow key={tx.id} tx={tx} used={used} />)
        )}
      </div>
    </section>
  );
}
