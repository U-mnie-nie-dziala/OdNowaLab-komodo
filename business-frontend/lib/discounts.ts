import { servicesApi } from "./api";
import type { ServiceResponseDto } from "./types";
import { DISCOUNT_TIERS, discountPctFromName } from "./format";

export interface DiscountTier {
  serviceId: number;
  pct: number;
  cost: number;
  name: string;
}

const cacheByCompany = new Map<number, DiscountTier[]>();

export async function ensureCompanyDiscountTiers(
  companyId: number
): Promise<DiscountTier[]> {
  const cached = cacheByCompany.get(companyId);
  if (cached) return cached;

  const companyServices = await servicesApi.byProvider(companyId);
  const byPct = new Map<number, ServiceResponseDto>();
  for (const s of companyServices) {
    const pct = discountPctFromName(s.name);
    if (pct != null && DISCOUNT_TIERS.some((t) => t.pct === pct) && !byPct.has(pct)) {
      byPct.set(pct, s);
    }
  }

  const result: DiscountTier[] = [];
  for (const tier of DISCOUNT_TIERS) {
    let svc = byPct.get(tier.pct);
    if (!svc) {
      svc = await servicesApi.create({
        name: tier.name,
        coinCost: tier.cost,
        providerId: companyId,
      });
    }
    result.push({
      serviceId: svc.id,
      pct: tier.pct,
      cost: svc.coinCost,
      name: tier.name,
    });
  }

  cacheByCompany.set(companyId, result);
  return result;
}

export async function ensureGlobalDiscountTiers(): Promise<DiscountTier[]> {
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
  return result;
}
