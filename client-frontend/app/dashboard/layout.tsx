import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Logo, LogoMark } from "@/components/Logo";
import {
  CoinIcon,
  LogoutIcon,
  UserIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { formatCoins } from "@/lib/format";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <LogoMark className="h-10 w-10 animate-pulse" />
          <span className="text-sm">Wczytywanie panelu…</span>
        </div>
      </div>
    );
  }

  const userCard = (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="flex items-center gap-2 text-brand-700">
        <UserIcon className="h-4 w-4" />
        <span className="truncate text-sm font-bold">
          {user.name} {user.surname}
        </span>
      </div>
      <p className="mt-1 truncate text-xs text-[var(--ink-soft)]">{user.email}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-coin-700">
        <CoinIcon className="h-4 w-4" />
        {formatCoins(user.coins)}
      </p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-brand-50"
        >
          <LogoutIcon className="h-4 w-4" /> Wyloguj się
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/5 bg-white p-5 lg:flex">
        <Link href="/dashboard" className="mb-8">
          <Logo />
        </Link>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <UserIcon className="h-5 w-5 shrink-0" />
            Moje konto
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-800/80 transition hover:bg-brand-50 hover:text-brand-800"
          >
            <CoinIcon className="h-5 w-5 shrink-0" />
            O programie
          </Link>
        </nav>
        <div className="mt-auto">{userCard}</div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 lg:hidden">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg p-2 text-brand-800 hover:bg-brand-50"
            aria-label="Wyloguj"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </form>
      </header>

      <main className="flex-1 pt-16 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
