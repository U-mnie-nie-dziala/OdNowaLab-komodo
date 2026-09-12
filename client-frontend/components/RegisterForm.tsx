"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth";
import { AlertIcon, ArrowRightIcon } from "@/components/icons";
import type { AuthFormState } from "@/lib/validations";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
        Załóż konto klienta
      </h1>
      <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
        Zacznij zbierać Monety Wołomińskie za lokalne zakupy.
      </p>

      {state.message && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={action} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Imię" error={state.errors?.name?.[0]}>
            <input
              id="name"
              name="name"
              autoComplete="given-name"
              required
              className={inp(state.errors?.name)}
              placeholder="Jan"
            />
          </Field>
          <Field label="Nazwisko" error={state.errors?.surname?.[0]}>
            <input
              id="surname"
              name="surname"
              autoComplete="family-name"
              required
              className={inp(state.errors?.surname)}
              placeholder="Kowalski"
            />
          </Field>
        </div>
        <Field label="Adres e-mail" error={state.errors?.email?.[0]}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inp(state.errors?.email)}
            placeholder="jan@example.com"
          />
        </Field>
        <Field
          label="Telefon"
          error={state.errors?.phoneNumber?.[0]}
          hint="Opcjonalnie – identyfikacja przy kasie"
        >
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={inp(state.errors?.phoneNumber)}
            placeholder="501 234 567"
          />
        </Field>
        <Field label="Hasło" error={state.errors?.password?.[0]}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inp(state.errors?.password)}
            placeholder="min. 8 znaków"
          />
        </Field>
        <button
          type="submit"
          className="btn-primary w-full btn-lg"
          disabled={pending}
        >
          {pending ? (
            "Zakładanie konta…"
          ) : (
            <>
              Załóż konto <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
        Masz już konto?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:underline"
        >
          Zaloguj się
        </Link>
      </p>
    </>
  );
}

function inp(error?: string[]) {
  return `input ${error ? "input-error" : ""}`;
}

function Field({
  label,
  error,
  hint,
  children,
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
        {hint && !error && (
          <span className="text-xs text-slate-400">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
