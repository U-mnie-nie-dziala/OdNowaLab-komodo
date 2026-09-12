"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import {
  ChartIcon,
  CloseIcon,
  CoinIcon,
  LogoutIcon,
  MenuIcon,
  StoreIcon,
  TagIcon,
  UserIcon,
} from "@/components/icons";
import { formatCoins, formatNumber } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Przegląd", icon: ChartIcon, exact: true },
  { href: "/dashboard/partnerzy", label: "Partnerzy", icon: StoreIcon },
  { href: "/dashboard/znizki", label: "Zniżki", icon: TagIcon },
  { href: "/", label: "O programie", icon: CoinIcon },
];

type DashboardShellProps = {
  children: ReactNode;
  userName: string;
  email: string;
  coins: number;
};

export function DashboardShell({
  children,
  userName,
  email,
  coins,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(item: (typeof NAV)[number]) {
    if (item.href === "/") return false;
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  const navLinks = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-brand-600 text-white"
                : "text-[var(--ink)] hover:bg-lav-100"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userCard = (
    <div className="border-2 border-[var(--ink)] bg-lav-100 p-4">
      <div className="flex items-center gap-2 text-brand-700">
        <UserIcon className="h-4 w-4" />
        <span className="truncate text-sm font-bold">{userName}</span>
      </div>
      <p className="mt-1 truncate text-xs text-[var(--ink-soft)]">{email}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
        <CoinIcon className="h-4 w-4" />
        {formatCoins(coins)}
      </p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center gap-2 border-2 border-[var(--ink)] bg-white px-3 py-2 text-xs font-bold text-[var(--ink)] transition hover:bg-lav-100"
        >
          <LogoutIcon className="h-4 w-4" /> Wyloguj się
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r-2 border-[var(--ink)] bg-white p-5 lg:flex">
        <Link href="/dashboard" className="mb-8">
          <Logo />
        </Link>
        {navLinks}
        <div className="mt-auto">{userCard}</div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between gap-3 border-b-2 border-[var(--ink)] bg-white px-4 lg:hidden">
        <Link href="/dashboard" className="min-w-0 shrink">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 border-2 border-[var(--ink)] bg-lav-100 px-2.5 py-1 text-xs font-bold text-[var(--ink)]">
            <CoinIcon className="h-3.5 w-3.5" />
            {formatNumber(coins)} WM
          </span>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 text-[var(--ink)] hover:bg-lav-100"
            aria-label="Menu"
          >
            {menuOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-white p-5 lg:hidden">
          {navLinks}
          <div className="mt-6">{userCard}</div>
        </div>
      )}

      <main className="flex-1 pt-16 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
