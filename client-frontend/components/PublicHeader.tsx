import Link from "next/link";

import { Logo } from "@/components/Logo";
import { ArrowRightIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";

export async function PublicHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Strona główna">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--ink-soft)] md:flex">
          <a href="#jak-to-dziala" className="hover:text-brand-700">
            Jak to działa
          </a>
          <a href="#korzysci" className="hover:text-brand-700">
            Korzyści
          </a>
          <a href="#przelicznik" className="hover:text-brand-700">
            Monety i zniżki
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Twój panel <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">
                Zaloguj się
              </Link>
              <Link href="/register" className="btn-primary">
                Dołącz do programu
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
