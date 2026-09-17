export function formatDate(
  input: Date | string | undefined,
  format: "short" | "long" = "short",
): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: format === "long" ? "long" : "short",
    year: "numeric",
  });
}

export function formatDateTime(
  input: Date | string | undefined,
  format: "short" | "long" = "short",
): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: format === "long" ? "long" : "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTimeFriendly(
  input: Date | string | undefined,
): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";

  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const now = new Date();
  const dayDelta = Math.round(
    (startOfDay(d) - startOfDay(now)) / (24 * 60 * 60 * 1000),
  );

  if (dayDelta === 0) return `Today, ${time}`;
  if (dayDelta === 1) return `Tomorrow, ${time}`;
  if (dayDelta === -1) return `Yesterday, ${time}`;

  if (dayDelta > 1 && dayDelta <= 6) {
    return (
      d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }) + `, ${time}`
    );
  }

  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function timeAgo(input: Date | string | undefined | null): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 45) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return formatDate(d);
}

/** Days between `input` and now, floor-rounded to whole days (negative = past). */
export function daysUntil(input: Date | string | undefined | null): number {
  if (!input) return NaN;
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return NaN;
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.round((startOfDay(d) - startOfDay(new Date())) / (24 * 60 * 60 * 1000));
}
