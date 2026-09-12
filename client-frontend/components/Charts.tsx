"use client";

export interface DayPoint {
  label: string;
  earned: number;
  spent: number;
}

export function ActivityBars({
  data,
  showSpent = true,
  earnedLabel = "Naliczone monety",
  spentLabel = "Wymienione monety",
}: {
  data: DayPoint[];
  showSpent?: boolean;
  earnedLabel?: string;
  spentLabel?: string;
}) {
  const max = Math.max(
    1,
    ...data.map((d) => (showSpent ? Math.max(d.earned, d.spent) : d.earned))
  );

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        Brak danych do wyświetlenia
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-56 items-end gap-2 sm:gap-3">
        {data.map((d, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end justify-center gap-1">
              <Bar value={d.earned} max={max} className="bg-brand-500" title={`${earnedLabel}: ${d.earned} WM`} />
              {showSpent && (
                <Bar value={d.spent} max={max} className="bg-coin-500" title={`${spentLabel}: ${d.spent} WM`} />
              )}
            </div>
            <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">
              {d.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-[var(--ink-soft)]">
        <Legend className="bg-brand-500" label={earnedLabel} />
        {showSpent && <Legend className="bg-coin-500" label={spentLabel} />}
      </div>
    </div>
  );
}

function Bar({
  value,
  max,
  className,
  title,
}: {
  value: number;
  max: number;
  className: string;
  title: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      className="relative flex w-2.5 sm:w-3.5 items-end"
      style={{ height: "100%" }}
      title={title}
    >
      <div
        className={`w-full rounded-t-md ${className} transition-all duration-500`}
        style={{ height: `${value === 0 ? 0 : Math.max(pct, 3)}%` }}
      />
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

export function ShareBar({
  label,
  value,
  total,
  colorClass = "bg-brand-500",
}: {
  label: string;
  value: number;
  total: number;
  colorClass?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--ink)]">{label}</span>
        <span className="tabular-nums text-[var(--ink-soft)]">
          {value}× · {pct}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
