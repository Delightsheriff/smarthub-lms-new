/** "45 sec", "12 min", "1 hr 5 min". Empty for unknown durations so
 *  callers can render conditionally. */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** Integer minor units in their own currency: 1250000 NGN → "₦12,500".
 *  Kobo only shows when there is some. An unknown currency code falls
 *  back to "USD 12.50"-style rather than throwing. */
export function formatMinor(minor: number | undefined, currency = "NGN"): string {
  if (typeof minor !== "number" || !Number.isFinite(minor)) return "—";
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currency.toUpperCase()} ${major.toLocaleString("en-NG")}`;
  }
}

/** 4000 → "40%", 1250 → "12.5%". */
export const formatBps = (bps: number | undefined): string =>
  typeof bps === "number" && Number.isFinite(bps)
    ? `${Number((bps / 100).toFixed(2))}%`
    : "—";

export const looksLikeHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);
