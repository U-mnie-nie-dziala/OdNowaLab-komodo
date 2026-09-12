export function Logo({ className = "", withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-brand-800">
            Wołomiński
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coin-600">
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
      <defs>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd977" />
          <stop offset="1" stopColor="#f0a91e" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#coinGrad)" />
      <circle cx="20" cy="20" r="18" fill="none" stroke="#d98a0b" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="#b46c08" strokeWidth="1" strokeDasharray="1 2.4" opacity="0.65" />
      <path
        d="M11 14 L14.5 26 L20 17 L25.5 26 L29 14"
        fill="none"
        stroke="#0f4d36"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 9.4 C22.4 11 22.4 13.4 20 15 C17.6 13.4 17.6 11 20 9.4 Z" fill="#137a4f" />
    </svg>
  );
}
