import Link from "next/link";

import { Logo } from "@/components/Logo";

export function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            Program partnerski powiatu wołomińskiego wspierający lokalne zakupy
            i rewitalizację miasta. Zbieraj Monety Wołomińskie i wymieniaj je
            na zniżki u lokalnych partnerów.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--ink)]">Program</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li>
              <a href="#jak-to-dziala" className="hover:text-brand-700">
                Jak to działa
              </a>
            </li>
            <li>
              <a href="#korzysci" className="hover:text-brand-700">
                Korzyści dla mieszkańców
              </a>
            </li>
            <li>
              <a href="#przelicznik" className="hover:text-brand-700">
                Monety i zniżki
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--ink)]">Dla klientów</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li>
              <Link href="/register" className="hover:text-brand-700">
                Załóż konto
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-brand-700">
                Zaloguj się
              </Link>
            </li>
            <li>
              <Link href="/dashboard/partnerzy" className="hover:text-brand-700">
                Partnerzy
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-brand-700">
                Twój panel
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} Wołomiński Program Partnerski · Portal
          klienta
        </div>
      </div>
    </footer>
  );
}
