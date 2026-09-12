"use server";

import { revalidatePath } from "next/cache";

import { ApiError, createTransaction } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { ensureCompanyDiscountTiers } from "@/lib/discounts";
import { todayIso } from "@/lib/format";
import { getSessionTokens } from "@/lib/session";
import { RedeemSchema, type RedeemFormState } from "@/lib/validations";

export async function redeemDiscountAction(
  _prev: RedeemFormState,
  formData: FormData,
): Promise<RedeemFormState> {
  const parsed = RedeemSchema.safeParse({
    companyId: formData.get("companyId"),
    pct: formData.get("pct"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const tokens = await getSessionTokens();
  const accessToken = tokens?.accessToken;

  if (!accessToken) {
    return { message: "Sesja wygasła. Zaloguj się ponownie." };
  }

  const { companyId, pct } = parsed.data;

  try {
    const tiers = await ensureCompanyDiscountTiers(companyId, accessToken);
    const tier = tiers.find((t) => t.pct === pct);
    if (!tier) {
      return { message: "Nie znaleziono wybranej zniżki u tego partnera." };
    }

    if (user.coins < tier.cost) {
      return {
        message: `Za mało monet. Potrzebujesz ${tier.cost} WM, masz ${user.coins} WM.`,
      };
    }

    const voucher = await createTransaction(
      {
        userId: user.id,
        serviceId: tier.serviceId,
        date: todayIso(),
      },
      accessToken,
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/znizki");

    return {
      success: true,
      voucherId: voucher.id,
      message: `Wykupiono bon ${tier.pct}%. Pokaż go przy kasie partnera, aby zrealizować zniżkę.`,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        return {
          message:
            error.message ||
            "Nie udało się wykupić bonu (za mało monet lub nieprawidłowe dane).",
        };
      }
      return { message: error.message };
    }
    return { message: "Nie udało się wykupić bonu. Spróbuj ponownie." };
  }
}
