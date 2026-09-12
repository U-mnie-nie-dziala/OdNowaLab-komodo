"use client";

import { useActionState, useEffect, useState } from "react";

import { redeemDiscountAction } from "@/app/actions/redeem";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CoinIcon,
  TagIcon,
} from "@/components/icons";
import { DISCOUNT_TIERS, formatCoins, formatNumber } from "@/lib/format";
import type { RedeemFormState } from "@/lib/validations";

type PartnerOption = {
  id: number;
  name: string;
  isInRevitalizationZone: boolean;
};

const initialState: RedeemFormState = {};

export function RedeemForm({
  partners,
  coins,
}: {
  partners: PartnerOption[];
  coins: number;
}) {
  const [state, action, pending] = useActionState(
    redeemDiscountAction,
    initialState,
  );
  const [pct, setPct] = useState<number>(
    DISCOUNT_TIERS.find((t) => coins >= t.cost)?.pct ?? DISCOUNT_TIERS[0].pct,
  );
  const [companyId, setCompanyId] = useState<string>(
    partners[0] ? String(partners[0].id) : "",
  );

  const selected = DISCOUNT_TIERS.find((t) => t.pct === pct) ?? DISCOUNT_TIERS[0];
  const canAfford = coins >= selected.cost;

  useEffect(() => {
    if (state.success) {
      setPct(
        DISCOUNT_TIERS.find((t) => coins - selected.cost >= t.cost)?.pct ??
          DISCOUNT_TIERS[0].pct,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset selection after successful redeem
  }, [state.success, state.voucherId]);

  if (partners.length === 0) {
    return (
      <div className="border-2 border-[var(--ink)]/15 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
        Brak partnerów w programie. Wykup bonu będzie dostępny, gdy pojawią się
        sklepy partnerskie.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.success && state.message && (
        <div className="flex items-start gap-2 border-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}
      {state.message && !state.success && (
        <div className="flex items-start gap-2 border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div>
        <label className="label" htmlFor="companyId">
          Partner (gdzie wykorzystasz bon)
        </label>
        <select
          id="companyId"
          name="companyId"
          className="input"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.isInRevitalizationZone ? " · strefa rewitalizacji" : ""}
            </option>
          ))}
        </select>
        {state.errors?.companyId && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {state.errors.companyId[0]}
          </p>
        )}
      </div>

      <div>
        <p className="label">Wybierz zniżkę</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {DISCOUNT_TIERS.map((tier) => {
            const ready = coins >= tier.cost;
            const active = pct === tier.pct;
            return (
              <label
                key={tier.pct}
                className={`flex cursor-pointer items-center gap-3 border-2 p-3 transition ${
                  active
                    ? "border-brand-600 bg-brand-50"
                    : "border-[var(--ink)]/15 hover:border-[var(--ink)]/40"
                } ${!ready ? "opacity-55" : ""}`}
              >
                <input
                  type="radio"
                  name="pct"
                  value={tier.pct}
                  checked={active}
                  onChange={() => setPct(tier.pct)}
                  className="sr-only"
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-600 text-white">
                  <TagIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-bold text-brand-600">
                    Zniżka {tier.pct}%
                  </span>
                  <span className="block text-xs font-bold text-[var(--ink)]">
                    {formatCoins(tier.cost)}
                    {!ready && (
                      <span className="ml-1 font-medium text-slate-400">
                        · brakuje {formatCoins(tier.cost - coins)}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {state.errors?.pct && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {state.errors.pct[0]}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-[var(--ink)] bg-lav-100 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <CoinIcon className="h-4 w-4" />
          Saldo po wykupie:{" "}
          <span className="font-bold text-brand-600">
            {canAfford
              ? formatCoins(coins - selected.cost)
              : formatNumber(coins) + " WM"}
          </span>
        </p>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending || !canAfford || !companyId}
        >
          {pending ? (
            "Wykupywanie…"
          ) : (
            <>
              Wykup bon {selected.pct}%{" "}
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
