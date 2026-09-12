import Link from "next/link";
import type { ReactNode } from "react";

import { Logo, LogoMark } from "./Logo";
import { CheckIcon } from "./icons";

export function AuthShell({
  children,
  bullets,
}: {
  children: ReactNode;
  bullets: string[];
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden border-r-2 border-[var(--ink)] bg-brand-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 bg-lav-200/20" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-64 w-64 bg-brand-900/30" />

        <Link href="/" className="relative inline-flex items-center gap-2.5">
          <LogoMark className="h-10 w-10" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-bold tracking-tight">
              Wołomiński
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-lav-200">
              Program Partnerski
            </span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Zbieraj lokalną walutę Wołomina za codzienne zakupy
          </h2>
          <ul className="mt-8 space-y-3.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-brand-50">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[var(--ink)] text-white">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-[15px]">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-100/70">
          Inicjatywa rewitalizacji powiatu wołomińskiego
        </p>
      </aside>

      <main className="flex flex-col bg-[var(--bg)]">
        <div className="flex items-center justify-between p-5 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
