"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { useAuth, ApiError } from "@/lib/auth";
import { isValidNip } from "@/lib/format";
import { AlertIcon, ArrowRightIcon, CheckIcon, CheckCircleIcon } from "@/components/icons";

interface FormState {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  companyName: string;
  nip: string;
  address: string;
  description: string;
}

const EMPTY: FormState = {
  name: "", surname: "", email: "", phone: "", password: "", confirm: "",
  companyName: "", nip: "", address: "", description: "",
};

const STEP_LABELS = ["Właściciel", "Sklep", "Potwierdź"];

export default function RegisterPage() {
  const router = useRouter();
  const { register, login, confirmSignUp, resendCode, session, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace("/panel");
  }, [loading, session, router]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep1(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Podaj imię.";
    else if (form.name.length > 20) e.name = "Maks. 20 znaków.";
    if (!form.surname.trim()) e.surname = "Podaj nazwisko.";
    else if (form.surname.length > 20) e.surname = "Maks. 20 znaków.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Nieprawidłowy e-mail.";
    if (!/^\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Podaj 9-cyfrowy numer telefonu.";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password))
      e.password = "Min. 8 znaków, w tym wielka litera, mała litera i cyfra.";
    if (form.confirm !== form.password) e.confirm = "Hasła nie są identyczne.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.companyName.trim()) e.companyName = "Podaj nazwę firmy.";
    else if (form.companyName.length > 20) e.companyName = "Maks. 20 znaków.";
    if (!isValidNip(form.nip)) e.nip = "Nieprawidłowy NIP (10 cyfr).";
    if (!form.address.trim()) e.address = "Podaj adres sklepu.";
    if (!form.description.trim()) e.description = "Dodaj krótki opis.";
    else if (form.description.length > 200) e.description = "Maks. 200 znaków.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep1()) setStep(2);
  }

  function describeError(err: unknown): string {
    if (err instanceof ApiError && err.fieldErrors) {
      return "Serwer odrzucił dane: " + Object.values(err.fieldErrors).join(" ");
    }
    return err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.";
  }

  async function submitShop(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validateStep2()) return;
    setBusy(true);
    try {
      const { isConfirmed } = await register({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        phoneNumber: Number(form.phone.replace(/\s/g, "")),
        password: form.password,
        companyName: form.companyName.trim(),
        nip: form.nip.replace(/\D/g, ""),
        address: form.address.trim(),
        description: form.description.trim(),
      });
      if (isConfirmed) {
        await login(form.email, form.password);
        router.replace("/panel");
      } else {
        setInfo("Wysłaliśmy kod weryfikacyjny na Twój adres e-mail.");
        setStep(3);
        setBusy(false);
      }
    } catch (err) {
      setServerError(describeError(err));
      setBusy(false);
    }
  }

  async function submitConfirm(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setBusy(true);
    try {
      await confirmSignUp(form.email, code);
      await login(form.email, form.password);
      router.replace("/panel");
    } catch (err) {
      setServerError(describeError(err));
      setBusy(false);
    }
  }

  async function handleResend() {
    setServerError(null);
    setInfo(null);
    try {
      await resendCode(form.email);
      setInfo("Wysłaliśmy nowy kod na Twój e-mail.");
    } catch (err) {
      setServerError(describeError(err));
    }
  }

  const descLeft = 200 - form.description.length;
  const heading =
    step === 1 ? "Załóż konto właściciela" : step === 2 ? "Dane Twojego sklepu" : "Potwierdź e-mail";
  const sub =
    step === 1
      ? "Zacznijmy od Twoich danych logowania."
      : step === 2
        ? "Te informacje pojawią się w programie partnerskim."
        : "Wpisz kod weryfikacyjny wysłany na Twój adres e-mail.";

  return (
    <AuthShell
      bullets={[
        "Wystaw swój sklep w programie w kilka minut",
        "Zniżki 10/30/50/100% są wspólne dla całego programu",
        "Od razu naliczaj monety i śledź statystyki",
      ]}
    >
      <div className="mb-6">
        <Stepper step={step} labels={STEP_LABELS} />
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">{heading}</h1>
      <p className="mt-1.5 text-sm text-[var(--ink-soft)]">{sub}</p>

      {info && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{info}</span>
        </div>
      )}
      {serverError && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Imię" error={errors.name}>
              <input className={inp(errors.name)} value={form.name} maxLength={20}
                onChange={(e) => set("name", e.target.value)} placeholder="Jan" />
            </Field>
            <Field label="Nazwisko" error={errors.surname}>
              <input className={inp(errors.surname)} value={form.surname} maxLength={20}
                onChange={(e) => set("surname", e.target.value)} placeholder="Kowalski" />
            </Field>
          </div>
          <Field label="Adres e-mail" error={errors.email}>
            <input type="email" className={inp(errors.email)} value={form.email}
              onChange={(e) => set("email", e.target.value)} placeholder="jan@moj-sklep.pl" />
          </Field>
          <Field label="Telefon" error={errors.phone} hint="9 cyfr – identyfikacja przy kasie">
            <input inputMode="numeric" className={inp(errors.phone)} value={form.phone}
              onChange={(e) => set("phone", e.target.value)} placeholder="501 234 567" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hasło" error={errors.password}>
              <input type="password" className={inp(errors.password)} value={form.password}
                onChange={(e) => set("password", e.target.value)} placeholder="min. 8 znaków" />
            </Field>
            <Field label="Powtórz hasło" error={errors.confirm}>
              <input type="password" className={inp(errors.confirm)} value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)} placeholder="powtórz" />
            </Field>
          </div>
          <button onClick={next} className="btn-primary w-full btn-lg">
            Dalej <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={submitShop} className="mt-6 space-y-4">
          <Field label="Nazwa firmy / sklepu" error={errors.companyName} hint="Maks. 20 znaków">
            <input className={inp(errors.companyName)} value={form.companyName} maxLength={20}
              onChange={(e) => set("companyName", e.target.value)} placeholder="EkoPiekarnia" />
          </Field>
          <Field label="NIP" error={errors.nip}>
            <input inputMode="numeric" className={inp(errors.nip)} value={form.nip}
              onChange={(e) => set("nip", e.target.value)} placeholder="123-456-32-18" />
          </Field>
          <Field label="Adres sklepu" error={errors.address}>
            <input className={inp(errors.address)} value={form.address}
              onChange={(e) => set("address", e.target.value)} placeholder="ul. Kościelna 12, Wołomin" />
          </Field>
          <Field label="Opis działalności" error={errors.description} hint={`${descLeft} znaków`}>
            <textarea rows={3} className={inp(errors.description)} value={form.description} maxLength={200}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Krótko opisz, czym zajmuje się Twój sklep…" />
          </Field>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setStep(1)} className="btn-outline btn-lg flex-1">
              Wstecz
            </button>
            <button type="submit" className="btn-primary btn-lg flex-[1.6]" disabled={busy}>
              {busy ? "Zakładanie…" : (<>Załóż konto <CheckIcon className="h-5 w-5" strokeWidth={2.5} /></>)}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={submitConfirm} className="mt-6 space-y-4">
          <Field label="Kod weryfikacyjny" hint="6 cyfr z wiadomości e-mail">
            <input inputMode="numeric" className="input tracking-[0.3em]" value={code}
              onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          </Field>
          <button type="submit" className="btn-primary w-full btn-lg" disabled={busy}>
            {busy ? "Potwierdzanie…" : (<>Potwierdź i wejdź do panelu <ArrowRightIcon className="h-5 w-5" /></>)}
          </button>
          <div className="text-center">
            <button type="button" onClick={handleResend} className="text-sm font-semibold text-brand-700 hover:underline">
              Wyślij kod ponownie
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
        Masz już konto?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </AuthShell>
  );
}

function inp(error?: string) {
  return `input ${error ? "input-error" : ""}`;
}

function Field({
  label, error, hint, children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="label">{label}</span>
        {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                done
                  ? "bg-brand-600 text-white"
                  : active
                    ? "bg-brand-600 text-white ring-4 ring-brand-500/15"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? <CheckIcon className="h-4 w-4" strokeWidth={3} /> : n}
            </span>
            <span className={`text-sm font-medium ${active || done ? "text-brand-800" : "text-slate-400"}`}>
              {label}
            </span>
            {i < labels.length - 1 && <span className="mx-1 h-px w-4 bg-slate-200 sm:w-6" />}
          </div>
        );
      })}
    </div>
  );
}
