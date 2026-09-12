
import { servicesApi } from "./api";
import type { ServiceResponseDto } from "./types";
import { DISCOUNT_TIERS, discountPctFromName } from "./format";

export interface DiscountTier {
  serviceId: number;
  pct: number;
  cost: number;
  name: string;
}

let cache: DiscountTier[] | null = null;

export async function ensureGlobalDiscountTiers(): Promise<DiscountTier[]> {
  if (cache) return cache;

  const all = await servicesApi.list();
  const globalByPct = new Map<number, ServiceResponseDto>();
  for (const s of all) {
    if (s.providerId != null) continue;
    const pct = discountPctFromName(s.name);
    if (pct != null && DISCOUNT_TIERS.some((t) => t.pct === pct) && !globalByPct.has(pct)) {
      globalByPct.set(pct, s);
    }
  }

  const result: DiscountTier[] = [];
  for (const tier of DISCOUNT_TIERS) {
    let svc = globalByPct.get(tier.pct);
    if (!svc) {
      svc = await servicesApi.create({
        name: tier.name,
        coinCost: tier.cost,
        providerId: null,
      });
    }
    result.push({
      serviceId: svc.id,
      pct: tier.pct,
      cost: svc.coinCost,
      name: tier.name,
    });
  }

  cache = result;
  return result;
}
