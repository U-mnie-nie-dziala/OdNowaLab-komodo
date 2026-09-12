"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircleIcon, AlertIcon, CloseIcon } from "./icons";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastContextValue {
  push: (t: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((ts) => [...ts, { ...t, id }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove]
  );

  const success = useCallback(
    (title: string, message?: string) => push({ kind: "success", title, message }),
    [push]
  );
  const error = useCallback(
    (title: string, message?: string) => push({ kind: "error", title, message }),
    [push]
  );

  return (
    <ToastContext.Provider value={{ push, success, error }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-lg shadow-black/10"
          >
            <span
              className={`mt-0.5 shrink-0 ${
                t.kind === "success"
                  ? "text-brand-600"
                  : t.kind === "error"
                    ? "text-red-500"
                    : "text-slate-500"
              }`}
            >
              {t.kind === "error" ? (
                <AlertIcon className="h-5 w-5" />
              ) : (
                <CheckCircleIcon className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ink)]">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Zamknij"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast musi być użyte wewnątrz <ToastProvider>.");
  return ctx;
}
