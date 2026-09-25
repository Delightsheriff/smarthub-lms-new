/**
 * Read + validate the `?next=` return path set by the auth gate when it
 * bounces an unauthenticated visit to /login.
 *
 * Security: only same-origin RELATIVE paths are allowed. Anything that
 * could redirect off-site (absolute URLs, protocol-relative `//host`,
 * `\` tricks) is rejected so a crafted login link can't land the user
 * on an external page post-auth. Also refuses `/login*` to avoid a
 * redirect loop.
 */
export function safeNextPath(
  searchOrParams: string | { get?: (key: string) => string | null } | null | undefined,
): string | null {
  if (!searchOrParams) return null;
  let raw: string | null = null;

  if (typeof searchOrParams === "object" && typeof searchOrParams.get === "function") {
    raw = searchOrParams.get("next");
  } else if (typeof searchOrParams === "string") {
    const trimmed = searchOrParams.trim();
    if (trimmed.startsWith("?") || trimmed.startsWith("next=") || trimmed.includes("&next=")) {
      try {
        raw = new URLSearchParams(trimmed.startsWith("?") ? trimmed.slice(1) : trimmed).get("next");
      } catch {
        raw = null;
      }
    } else {
      raw = trimmed;
    }
  }

  if (!raw) return null;
  // Must be an absolute path on this origin
  if (!raw.startsWith("/")) return null;
  // Reject protocol-relative and backslash tricks (e.g. /\evil.com, /\\evil.com, //evil.com)
  if (raw.startsWith("//") || raw.includes("\\")) return null;
  // Reject URLs containing a scheme (e.g. /http://evil.com, https://evil.com)
  if (raw.includes("://")) return null;
  // Reject login redirect loops
  if (raw === "/login" || raw.startsWith("/login?") || raw.startsWith("/login/")) return null;

  return raw;
}

/**
 * Convenience helper returning `/dashboard` as the fallback if no safe
 * next path is provided.
 */
export function getNextPath(
  searchParams?: { get?: (key: string) => string | null } | string | null,
): string {
  return safeNextPath(searchParams) ?? "/dashboard";
}
