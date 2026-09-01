/**
 * Next path helper — preserves `?next=` destination URL across login redirects.
 */
export function getNextPath(searchParams?: { get?: (key: string) => string | null }): string {
  if (!searchParams) return "/dashboard";
  const next = searchParams.get?.("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}
