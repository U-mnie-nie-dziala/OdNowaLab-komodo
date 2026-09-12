"use client";

import Link from "next/link";
import { useActionState } from "react";

import { confirmAction, resendCodeAction } from "@/app/actions/auth";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons";
import type { AuthFormState } from "@/lib/validations";

const initialState: AuthFormState = {};

export function ConfirmForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(confirmAction, initialState);
  const [resendState, resendAction, resendPending] = useActionState(
    resendCodeAction,
    initialState,
  );

  const email = defaultEmail || state.email || resendState.email || "";

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
        Potwierdź e-mail
      </h1>
      <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
        Wpisz kod weryfikacyjny wysłany na Twój adres e-mail.
      </p>

      {resendState.success && resendState.message && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{resendState.message}</span>
        </div>
      )}
      {(state.message || (resendState.message && !resendState.success)) && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message || resendState.message}</span>
        </div>
      )}

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Adres e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`input ${state.errors?.email ? "input-error" : ""}`}
            defaultValue={email}
          />
          {state.errors?.email && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {state.errors.email[0]}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="confirmationCode">
            Kod weryfikacyjny
          </label>
          <input
            id="confirmationCode"
            name="confirmationCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            className={`input tracking-[0.3em] ${state.errors?.confirmationCode ? "input-error" : ""}`}
            placeholder="123456"
          />
          {state.errors?.confirmationCode && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {state.errors.confirmationCode[0]}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary w-full btn-lg"
          disabled={pending}
        >
          {pending ? (
            "Potwierdzanie…"
          ) : (
            <>
              Potwierdź e-mail <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <form action={resendAction} className="mt-4 text-center">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          className="text-sm font-semibold text-brand-700 hover:underline disabled:opacity-50"
          disabled={resendPending || !email}
        >
          {resendPending ? "Wysyłanie…" : "Wyślij kod ponownie"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
        Gotowy do logowania?{" "}
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
