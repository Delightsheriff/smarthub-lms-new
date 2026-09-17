export function formatPrice(n: number | undefined | null): string {
  if (typeof n !== "number" || !isFinite(n)) return "—";
  return `₦${n.toLocaleString("en-NG")}`;
}

/**
 * `pluralize(3, "task")` -> "3 tasks", `pluralize(1, "task")` -> "1 task".
 * Pass an explicit plural for irregular words: `pluralize(0, "activity", "activities")`.
 * `withCount: false` returns just the word ("task"/"tasks") for callers that
 * compose the number themselves.
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string = `${singular}s`,
  withCount: boolean = true,
): string {
  const word = count === 1 ? singular : plural;
  return withCount ? `${count} ${word}` : word;
}

/** Single-letter avatar initial: "Amadi Delight" -> "A", "" / undefined -> "?". */
export function getInitial(name: string | undefined | null): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "?";
}
