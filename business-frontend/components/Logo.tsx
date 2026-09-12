export function Logo({ className = "", withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-tight text-[var(--ink)]">
            Wołomiński
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
            Program Partnerski
          </span>
        </span>
      )}
    </span>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Logo programu">
      {/* Kanciasty blok w kolorze marki */}
      <rect x="1.5" y="1.5" width="37" height="37" fill="#2b37e0" />
      <rect x="1.5" y="1.5" width="37" height="37" fill="none" stroke="#0e0f1a" strokeWidth="3" />
      {/* Litera W jak Wołomin */}
      <path
        d="M9 12 L14 28 L20 18 L26 28 L31 12"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* Kanciasty akcent */}
      <rect x="30" y="30" width="6" height="6" fill="#0e0f1a" />
    </svg>
  );
}
