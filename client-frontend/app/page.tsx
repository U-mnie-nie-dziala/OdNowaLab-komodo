import Link from "next/link";

import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { LogoMark } from "@/components/Logo";
import {
  ArrowRightIcon,
  CoinIcon,
  HeartIcon,
  MapPinIcon,
  ScanIcon,
  StoreIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { DISCOUNT_TIERS, EARN_RATE } from "@/lib/format";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <Hero signedIn={Boolean(user)} />
        <TrustStrip />
        <HowItWorks />
        <Benefits />
        <Converter />
        <CtaBand signedIn={Boolean(user)} />
      </main>
      <PublicFooter />
    </>
  );
}

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-b-2 border-[var(--ink)] bg-lav-200">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-12 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
        <div>
          <span className="badge bg-brand-100 text-brand-800">
            <MapPinIcon className="h-3.5 w-3.5" /> Powiat Wołomiński
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-brand-600 sm:text-6xl">
            Lokalne zakupy,
            <br />
            które się{" "}
            <span className="relative whitespace-nowrap text-[var(--ink)]">
              opłacają
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="10"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 7 L198 4"
                  fill="none"
                  stroke="#2b37e0"
                  strokeWidth="4"
                  strokeLinecap="square"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
            Dołącz do{" "}
            <strong className="text-brand-800">
              Wołomińskiego Programu Partnerskiego
            </strong>{" "}
            – zbieraj{" "}
            <strong className="text-brand-800">Monety Wołomińskie</strong> za
            zakupy u lokalnych partnerów i wymieniaj je na zniżki.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {signedIn ? (
              <Link href="/dashboard" className="btn-primary btn-lg">
                Przejdź do panelu <ArrowRightIcon className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary btn-lg">
                  Załóż konto <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link href="/login" className="btn-outline btn-lg">
                  Mam już konto
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Rejestracja zajmuje 2 minuty · Darmowe dla mieszkańców
          </p>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="animate-floaty card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
            <StoreIcon className="h-5 w-5 text-brand-600" /> Twoje konto
          </div>
          <span className="badge bg-brand-100 text-brand-700">Klient</span>
        </div>

        <div className="mt-6 border-2 border-[var(--ink)] bg-brand-600 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-100/90">
            Saldo monet
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display text-4xl font-bold tabular-nums">
              1 240
            </span>
            <span className="mb-1 font-bold text-lav-200">WM</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-brand-50">
            <CoinIcon className="h-4 w-4" />+{EARN_RATE} monety za każdą wydaną
            złotówkę
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <RowLine
            icon={<ScanIcon className="h-4 w-4" />}
            label="Zakup 45 zł – EkoPiekarnia"
            value="+180 WM"
            positive
          />
          <RowLine
            icon={<TagIcon className="h-4 w-4" />}
            label="Wymiana – Zniżka 30%"
            value="−300 WM"
          />
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden rotate-[-6deg] border-2 border-[var(--ink)] bg-white p-3 sm:block">
        <LogoMark className="h-10 w-10" />
      </div>
    </div>
  );
}

function RowLine({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
        <span className="text-brand-600">{icon}</span>
        {label}
      </span>
      <span
        className={`text-sm font-bold tabular-nums ${positive ? "text-brand-600" : "text-coin-600"}`}
      >
        {value}
      </span>
    </div>
  );
}

function TrustStrip() {
  const items = [
    { icon: <StoreIcon className="h-5 w-5" />, label: "Lokalne sklepy" },
    { icon: <UsersIcon className="h-5 w-5" />, label: "Mieszkańcy i przyjezdni" },
    { icon: <HeartIcon className="h-5 w-5" />, label: "Rewitalizacja miasta" },
    { icon: <CoinIcon className="h-5 w-5" />, label: "Waluta lokalna" },
  ];
  return (
    <div className="border-y border-black/5 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm font-medium text-[var(--ink-soft)] sm:px-6">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="text-brand-500">{it.icon}</span>
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <ScanIcon className="h-6 w-6" />,
      title: "Robisz zakupy u partnerów",
      text: "Przy kasie sklep skanuje Twój numer telefonu lub identyfikator. Zakup trafia do programu.",
      tag: "Krok 1",
    },
    {
      icon: <CoinIcon className="h-6 w-6" />,
      title: "Zbierasz Monety Wołomińskie",
      text: `Za każdą wydaną złotówkę otrzymujesz ${EARN_RATE} Monety Wołomińskie na swoje konto.`,
      tag: "Krok 2",
    },
    {
      icon: <TagIcon className="h-6 w-6" />,
      title: "Wymieniasz na zniżki",
      text: "W placówkach w strefie rewitalizacji wymieniasz monety na zniżki 10%, 30%, 50% lub 100%.",
      tag: "Krok 3",
    },
  ];
  return (
    <section id="jak-to-dziala" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHead
        eyebrow="Jak to działa"
        title="Prosty obieg lokalnej waluty"
        subtitle="Monety Wołomińskie krążą między mieszkańcami a lokalnymi biznesami – im więcej zakupów u partnerów, tym więcej korzyści dla całej społeczności."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="card relative p-7">
            <span className="badge absolute right-5 top-5 bg-brand-50 text-brand-600">
              {s.tag}
            </span>
            <div className="flex h-12 w-12 items-center justify-center bg-brand-600 text-white">
              {s.icon}
            </div>
            <h3 className="mt-5 text-lg font-bold text-brand-600">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    {
      icon: <CoinIcon className="h-6 w-6" />,
      title: "Prawdziwe zniżki",
      text: "Monety wymieniasz na konkretne rabaty u partnerów w strefie rewitalizacji.",
    },
    {
      icon: <HeartIcon className="h-6 w-6" />,
      title: "Wspierasz lokalnie",
      text: "Każdy zakup wzmacnia małe sklepy i inicjatywy rewitalizacji powiatu.",
    },
    {
      icon: <StoreIcon className="h-6 w-6" />,
      title: "Jedna waluta",
      text: "Te same Monety Wołomińskie działają u wielu partnerów w programie.",
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: "Blisko domu",
      text: "Korzystasz z oferty sklepów w Wołominie i okolicach – bez skomplikowanych aplikacji.",
    },
  ];
  return (
    <section id="korzysci" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Korzyści dla mieszkańców"
          title="Dlaczego warto dołączyć?"
          subtitle="Wołomiński Program Partnerski nagradza lokalne zakupy i pomaga utrzymać pieniądze w społeczności."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="border-2 border-[var(--ink)] bg-lav-100 p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center border-2 border-[var(--ink)] bg-white text-brand-600">
                {b.icon}
              </div>
              <h3 className="mt-4 font-bold text-brand-600">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Converter() {
  return (
    <section id="przelicznik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHead
        eyebrow="Monety i zniżki"
        title="Jak przeliczamy zakupy na monety"
        subtitle="Przelicznik jest jednakowy dla wszystkich sklepów w programie – dzięki temu system jest przejrzysty dla każdego mieszkańca."
      />

      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card flex flex-col items-center justify-center gap-4 p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
            Przelicznik
          </p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="font-display text-4xl font-bold text-brand-600">
                1 zł
              </span>
              <span className="text-xs text-slate-400">wydane w sklepie</span>
            </div>
            <ArrowRightIcon className="h-7 w-7 text-brand-400" />
            <div className="flex flex-col items-center">
              <span className="flex items-baseline gap-1 font-display text-4xl font-bold text-[var(--ink)]">
                {EARN_RATE} <CoinIcon className="h-6 w-6" />
              </span>
              <span className="text-xs text-slate-400">Monety Wołomińskie</span>
            </div>
          </div>
          <p className="mt-2 max-w-xs text-sm text-[var(--ink-soft)]">
            Przykład: zakupy za <strong>50 zł</strong> to{" "}
            <strong className="text-coin-600">200 WM</strong> na Twoim koncie.
          </p>
        </div>

        <div className="card p-7">
          <h3 className="text-lg font-bold text-brand-600">
            Progi zniżek za monety
          </h3>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Zebrane monety wymieniasz na jedną ze standardowych zniżek:
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {DISCOUNT_TIERS.map((t) => (
              <div
                key={t.pct}
                className="flex items-center justify-between border-2 border-[var(--ink)]/12 bg-lav-100 px-4 py-3"
              >
                <span className="flex items-center gap-2 font-bold text-brand-800">
                  <TagIcon className="h-4 w-4 text-brand-500" /> Zniżka {t.pct}%
                </span>
                <span className="bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
                  {t.cost} WM
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden border-2 border-[var(--ink)] bg-brand-600 px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 bg-lav-200/20" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-48 w-48 bg-brand-900/30" />
        <h2 className="relative font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Zacznij zbierać Monety Wołomińskie
        </h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-brand-100">
          Załóż darmowe konto, rób zakupy u partnerów programu i korzystaj ze
          zniżek wspierających lokalną społeczność.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          {signedIn ? (
            <Link href="/dashboard" className="btn-coin btn-lg">
              Otwórz panel <ArrowRightIcon className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn-coin btn-lg">
                Załóż konto <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="btn-lg btn border border-white/25 text-white hover:bg-white/10"
              >
                Zaloguj się
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-600 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-[var(--ink-soft)]">{subtitle}</p>
    </div>
  );
}
