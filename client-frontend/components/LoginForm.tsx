"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons";
import type { AuthFormState } from "@/lib/validations";

const initialState: AuthFormState = {};

export function LoginForm({
  defaultEmail = "",
  confirmed = false,
}: {
  defaultEmail?: string;
  confirmed?: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight text-brand-600">
        Zaloguj się
      </h1>
      <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
        Panel klienta Wołomińskiego Programu Partnerskiego.
      </p>

      {confirmed && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>E-mail potwierdzony. Możesz się zalogować.</span>
        </div>
      )}
      {state.message && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {state.message}
            {state.email && (
              <>
                {" "}
                <Link
                  href={`/confirm?email=${encodeURIComponent(state.email)}`}
                  className="font-semibold underline"
                >
                  Potwierdź konto
                </Link>
              </>
            )}
          </span>
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
            placeholder="np. jan@example.com"
            defaultValue={defaultEmail}
          />
          {state.errors?.email && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {state.errors.email[0]}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="password">
            Hasło
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`input ${state.errors?.password ? "input-error" : ""}`}
            placeholder="Twoje hasło"
          />
          {state.errors?.password && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {state.errors.password[0]}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary w-full btn-lg"
          disabled={pending}
        >
          {pending ? (
            "Logowanie…"
          ) : (
            <>
              Zaloguj się <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
        Nie masz jeszcze konta?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-700 hover:underline"
        >
          Dołącz do programu
        </Link>
      </p>
    </>
  );
}
