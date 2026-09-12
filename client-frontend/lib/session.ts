import "server-only";

import { cookies } from "next/headers";

import { config } from "@/lib/config";
import type { AuthTokens } from "@/lib/types";

export type SessionTokens = {
  accessToken: string;
  idToken: string | null;
  refreshToken: string | null;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    path: "/",
    maxAge,
  } as const;
}

export async function createSession(tokens: AuthTokens) {
  const cookieStore = await cookies();
  const accessMaxAge = tokens.expiresIn || config.cookies.accessMaxAge;

  cookieStore.set(
    config.cookies.accessToken,
    tokens.accessToken,
    cookieOptions(accessMaxAge),
  );
  cookieStore.set(
    config.cookies.refreshToken,
    tokens.refreshToken,
    cookieOptions(config.cookies.refreshMaxAge),
  );
  cookieStore.set(
    config.cookies.idToken,
    tokens.idToken,
    cookieOptions(accessMaxAge),
  );
}

export async function updateSessionFromTokens(tokens: AuthTokens) {
  await createSession(tokens);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(config.cookies.accessToken);
  cookieStore.delete(config.cookies.refreshToken);
  cookieStore.delete(config.cookies.idToken);
}

export async function getSessionTokens(): Promise<SessionTokens | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(config.cookies.accessToken)?.value;
  if (!accessToken) {
    const refreshToken = cookieStore.get(config.cookies.refreshToken)?.value;
    if (!refreshToken) return null;
    return {
      accessToken: "",
      idToken: cookieStore.get(config.cookies.idToken)?.value ?? null,
      refreshToken,
    };
  }

  return {
    accessToken,
    idToken: cookieStore.get(config.cookies.idToken)?.value ?? null,
    refreshToken: cookieStore.get(config.cookies.refreshToken)?.value ?? null,
  };
}

export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(
    cookieStore.get(config.cookies.accessToken)?.value ||
      cookieStore.get(config.cookies.refreshToken)?.value,
  );
}
