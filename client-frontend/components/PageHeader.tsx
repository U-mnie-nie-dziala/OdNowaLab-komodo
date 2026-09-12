import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-brand-600 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[var(--ink-soft)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
