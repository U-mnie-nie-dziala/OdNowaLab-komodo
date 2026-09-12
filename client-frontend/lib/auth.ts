import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  ApiError,
  getMe,
  getUserCoinAdditions,
  getUserTransactions,
  logout as apiLogout,
  refreshTokens,
} from "@/lib/api";
import {
  createSession,
  deleteSession,
  getSessionTokens,
  updateSessionFromTokens,
} from "@/lib/session";
import type { CoinAddition, Transaction, User } from "@/lib/types";

async function ensureAccessToken(): Promise<string | null> {
  const tokens = await getSessionTokens();
  if (!tokens) return null;

  if (tokens.accessToken) return tokens.accessToken;

  if (!tokens.refreshToken) {
    await deleteSession();
    return null;
  }

  try {
    const refreshed = await refreshTokens(tokens.refreshToken);
    await updateSessionFromTokens(refreshed);
    return refreshed.accessToken;
  } catch {
    await deleteSession();
    return null;
  }
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  let accessToken = await ensureAccessToken();
  if (!accessToken) return null;

  try {
    return await getMe(accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      return null;
    }

    const tokens = await getSessionTokens();
    if (!tokens?.refreshToken) {
      await deleteSession();
      return null;
    }

    try {
      const refreshed = await refreshTokens(tokens.refreshToken);
      await updateSessionFromTokens(refreshed);
      accessToken = refreshed.accessToken;
      return await getMe(accessToken);
    } catch {
      await deleteSession();
      return null;
    }
  }
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getDashboardData(): Promise<{
  user: User;
  transactions: Transaction[];
  coinAdditions: CoinAddition[];
}> {
  const user = await requireUser();
  const accessToken = await ensureAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const [transactions, coinAdditions] = await Promise.all([
    getUserTransactions(user.id, accessToken).catch(() => [] as Transaction[]),
    getUserCoinAdditions(user.id, accessToken).catch(() => [] as CoinAddition[]),
  ]);

  return { user, transactions, coinAdditions };
}

export async function loginAndCreateSession(
  email: string,
  password: string,
) {
  const { login } = await import("@/lib/api");
  const tokens = await login(email, password);
  await createSession(tokens);
  return tokens.user;
}

export async function logoutCurrentUser() {
  const tokens = await getSessionTokens();
  if (tokens?.accessToken) {
    try {
      await apiLogout(tokens.accessToken);
    } catch {
      // Clear local session even if remote logout fails
    }
  }
  await deleteSession();
}
