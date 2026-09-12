"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo, LogoMark } from "@/components/Logo";
import {
  ChartIcon,
  ScanIcon,
  TagIcon,
  LogoutIcon,
  StoreIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";

const NAV = [
  { href: "/panel", label: "Statystyki", icon: ChartIcon, exact: true },
  { href: "/panel/kasjer", label: "Kasjer", icon: ScanIcon },
  { href: "/panel/oferty", label: "Zniżki", icon: TagIcon },
];

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { session, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <LogoMark className="h-10 w-10 animate-pulse" />
          <span className="text-sm">Wczytywanie panelu…</span>
        </div>
      </div>
    );
  }

  function isActive(item: (typeof NAV)[number]) {
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
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-brand-800/80 hover:bg-brand-50 hover:text-brand-800"
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
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="flex items-center gap-2 text-brand-700">
        <StoreIcon className="h-4 w-4" />
        <span className="truncate text-sm font-bold">{session.companyName}</span>
      </div>
      <p className="mt-1 truncate text-xs text-[var(--ink-soft)]">{session.ownerName}</p>
      <button
        onClick={() => {
          logout();
          router.replace("/");
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-brand-50"
      >
        <LogoutIcon className="h-4 w-4" /> Wyloguj się
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/5 bg-white p-5 lg:flex">
        <Link href="/panel" className="mb-8">
          <Logo />
        </Link>
        {navLinks}
        <div className="mt-auto">{userCard}</div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 lg:hidden">
        <Link href="/panel"><Logo /></Link>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-2 text-brand-800 hover:bg-brand-50"
          aria-label="Menu"
        >
          {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
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
