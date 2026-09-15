import { BRAND } from "@/configs/brand";

/**
 * The public marketing site's origin, for links that leave the LMS
 * (referrals, cross-sell to a cohort track, certificate verification).
 *
 * Resolution order:
 *  1. `NEXT_PUBLIC_PUBLIC_CLIENT_URL` — explicit env var override.
 *  2. Stripping LMS subdomain from `window.location.host` (e.g. `learn.smart-hub.academy` → `smart-hub.academy`).
 *  3. Fallback to `BRAND.url`.
 */
export function publicSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PUBLIC_CLIENT_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { protocol, host } = window.location;
    const parts = host.split(".");
    if (parts.length >= 3) return `${protocol}//${parts.slice(1).join(".")}`;
  }
  return BRAND.url;
}
