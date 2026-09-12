import "server-only";

import { createService, listServices } from "@/lib/api";
import { DISCOUNT_TIERS, discountPctFromName } from "@/lib/format";
import type { Service } from "@/lib/types";

export type DiscountTier = {
  serviceId: number;
  pct: number;
  cost: number;
  name: string;
};

/**
 * Resolve (and create if missing) the four program discount services
 * for a partner company — same model as business-frontend cashier.
 */
export async function ensureCompanyDiscountTiers(
  companyId: number,
  accessToken?: string | null,
): Promise<DiscountTier[]> {
  const companyServices = await listServices(accessToken, companyId);
  const byPct = new Map<number, Service>();

  for (const s of companyServices) {
    const pct = discountPctFromName(s.name);
    if (
      pct != null &&
      DISCOUNT_TIERS.some((t) => t.pct === pct) &&
      !byPct.has(pct)
    ) {
      byPct.set(pct, s);
    }
  }

  const result: DiscountTier[] = [];
  for (const tier of DISCOUNT_TIERS) {
    let svc = byPct.get(tier.pct);
    if (!svc) {
      svc = await createService(
        {
          name: tier.name,
          coinCost: tier.cost,
          providerId: companyId,
        },
        accessToken,
      );
    }
    result.push({
      serviceId: svc.id,
      pct: tier.pct,
      cost: svc.coinCost,
      name: tier.name,
    });
  }
  return result;
}

export function isActiveVoucher(tx: {
  isValid: boolean;
  isConsumed: boolean;
}): boolean {
  return tx.isValid && !tx.isConsumed;
}

export function isUsedVoucher(tx: {
  isValid: boolean;
  isConsumed: boolean;
}): boolean {
  return tx.isConsumed || !tx.isValid;
}
