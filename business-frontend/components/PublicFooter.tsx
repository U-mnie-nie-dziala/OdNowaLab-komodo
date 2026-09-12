import Link from "next/link";
import { Logo } from "./Logo";

export function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            Program partnerski powiatu wołomińskiego wspierający lokalne, małe biznesy
            i rewitalizację miasta. Nagradzaj klientów Monetami Wołomińskimi i
            buduj lokalną społeczność.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--ink)]">Program</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li><a href="#jak-to-dziala" className="hover:text-brand-700">Jak to działa</a></li>
            <li><a href="#korzysci" className="hover:text-brand-700">Korzyści dla biznesu</a></li>
            <li><a href="#przelicznik" className="hover:text-brand-700">Monety i zniżki</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--ink)]">Dla właścicieli</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li><Link href="/register" className="hover:text-brand-700">Dołącz do programu</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Zaloguj się</Link></li>
            <li><Link href="/panel" className="hover:text-brand-700">Panel właściciela</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} Wołomiński Program Partnerski · Projekt demonstracyjny
          na potrzeby inicjatywy rewitalizacji.
        </div>
      </div>
    </footer>
  );
}
