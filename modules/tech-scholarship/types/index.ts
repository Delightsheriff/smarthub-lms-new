import type {
  ApiScholarshipApplication,
  ApiScholarshipBanner,
} from "./api.types";

/**
 * Display names for the seed track keys — synced with
 * `SEED_TRACK_LABELS` in smarthub-api `models/ScholarshipApplication.ts`.
 * Tracks are per-program free strings now, so anything not listed here
 * falls back to a humanised key via `scholarshipTrackLabel`.
 */
export const SCHOLARSHIP_TRACKS: Record<string, string> = {
  "web-dev": "Web Development",
  "data-analysis": "Data Analysis",
  "data-science": "Data Science",
  "ai-engineering": "AI Engineering",
  devops: "DevOps Engineering",
  cyber: "Cybersecurity",
  "product-design": "Product Design",
};

/** Labels for the seed tier keys (`SEED_TIER_LABELS` in the same model).
 *  Tiers are program-defined, so unknown keys humanise too. */
export const SCHOLARSHIP_TIERS: Record<string, string> = {
  full: "Full scholarship",
  partial: "Partial scholarship",
  standard: "Standard scholarship",
};

/** "cloud-ops" / "cloud_ops" → "Cloud ops". */
export function humaniseKey(key: string): string {
  const words = key.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
}

export function scholarshipTrackLabel(key: string | undefined | null): string {
  if (!key) return "";
  return SCHOLARSHIP_TRACKS[key] ?? humaniseKey(key);
}

export function scholarshipTierLabel(
  key: string | undefined | null,
): string | undefined {
  if (!key) return undefined;
  return SCHOLARSHIP_TIERS[key] ?? humaniseKey(key);
}

/** Stages at which the LMS surfaces the scholarship card — the scholar is
 *  in (or about to be in) the cohort. Earlier funnel stages live on the
 *  public site; rejected/withdrawn get nothing (legacy ACTIVE_STAGES). */
export const ACTIVE_SCHOLAR_STAGES: ReadonlySet<
  ApiScholarshipApplication["stage"]
> = new Set<ApiScholarshipApplication["stage"]>(["admitted", "enrolled"]);

export function isActiveScholar(
  app: ApiScholarshipApplication | null | undefined,
): boolean {
  return !!app && ACTIVE_SCHOLAR_STAGES.has(app.stage);
}

/** A scholarship holder's dashboard tile payload. `null` when the user
 *  has never applied. */
export type ScholarshipApplicationUi = ApiScholarshipApplication | null;

export type ScholarshipBannerUi = ApiScholarshipBanner;
