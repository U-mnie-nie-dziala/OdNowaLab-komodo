"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { useAuth, ApiError } from "@/lib/auth";
import { AlertIcon, ArrowRightIcon, CheckCircleIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const { login, confirmSignUp, resendCode, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"login" | "confirm">("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace("/panel");
  }, [loading, session, router]);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace("/panel");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setMode("confirm");
        setInfo("Konto nie zostało jeszcze potwierdzone. Wpisz kod wysłany na Twój e-mail.");
      } else {
        setError(err instanceof Error ? err.message : "Nie udało się zalogować.");
      }
      setBusy(false);
    }
  }

  async function submitConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await confirmSignUp(email, code);
      await login(email, password);
      router.replace("/panel");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się potwierdzić konta.");
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      await resendCode(email);
      setInfo("Wysłaliśmy nowy kod na Twój e-mail.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wysłać kodu.");
    }
  }

  return (
    <AuthShell
      bullets={[
        "Naliczaj Monety Wołomińskie klientom przy kasie",
        "Śledź statystyki operacji w swoim sklepie",
        "Przyciągaj mieszkańców do lokalnych zakupów",
      ]}
    >
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
        {mode === "login" ? "Zaloguj się do panelu" : "Potwierdź konto"}
      </h1>
      <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
        {mode === "login"
          ? "Panel właściciela biznesu i kasjera."
          : "Wpisz kod weryfikacyjny wysłany na Twój adres e-mail."}
      </p>

      {info && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{info}</span>
        </div>
      )}
      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === "login" ? (
        <form onSubmit={submitLogin} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Adres e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="np. adres@twoj-sklep.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="Twoje hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full btn-lg" disabled={busy}>
            {busy ? "Logowanie…" : (<>Zaloguj się <ArrowRightIcon className="h-5 w-5" /></>)}
          </button>
        </form>
      ) : (
        <form onSubmit={submitConfirm} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="code">Kod weryfikacyjny</label>
            <input
              id="code"
              inputMode="numeric"
              required
              className="input tracking-[0.3em]"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full btn-lg" disabled={busy}>
            {busy ? "Potwierdzanie…" : (<>Potwierdź i zaloguj <ArrowRightIcon className="h-5 w-5" /></>)}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setMode("login")} className="text-[var(--ink-soft)] hover:underline">
              ← Wróć
            </button>
            <button type="button" onClick={handleResend} className="font-semibold text-brand-700 hover:underline">
              Wyślij kod ponownie
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
        Nie masz jeszcze konta?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Dołącz do programu
        </Link>
      </p>
    </AuthShell>
  );
}
