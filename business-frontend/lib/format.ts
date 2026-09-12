export const EARN_RATE = 4;

export function plnToCoins(pln: number): number {
  return Math.floor(pln * EARN_RATE);
}

export const DISCOUNT_TIERS: { pct: number; cost: number; name: string }[] = [
  { pct: 10, cost: 1600, name: "Zniżka 10%" },
  { pct: 30, cost: 4800, name: "Zniżka 30%" },
  { pct: 50, cost: 8000, name: "Zniżka 50%" },
  { pct: 100, cost: 16000, name: "Zniżka 100%" },
];

export function discountPctFromName(name: string): number | null {
  const m = name.match(/(\d{1,3})\s*%/);
  return m ? Number(m[1]) : null;
}

const plCurrency = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 2,
});

const plNumber = new Intl.NumberFormat("pl-PL");

export function formatPln(value: number): string {
  return plCurrency.format(value);
}

export function formatNumber(value: number): string {
  return plNumber.format(value);
}

export function formatCoins(value: number): string {
  return `${plNumber.format(value)} WM`;
}

export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function formatPhone(phone: number | string): string {
  const s = String(phone);
  if (s.length !== 9) return s;
  return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}`;
}

export function formatNip(nip: string): string {
  const s = nip.replace(/\D/g, "");
  if (s.length !== 10) return nip;
  return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6, 8)}-${s.slice(8)}`;
}

export function isValidNip(nip: string): boolean {
  const s = nip.replace(/\D/g, "");
  if (s.length !== 10) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(s[i]), 0);
  return sum % 11 === Number(s[9]);
}
