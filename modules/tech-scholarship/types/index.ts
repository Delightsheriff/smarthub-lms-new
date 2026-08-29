import type {
  ApiScholarshipApplication,
  ApiScholarshipBanner,
} from "./api.types";

/** Display names for the scholarship tracks the wire uses as keys. */
export const SCHOLARSHIP_TRACKS: Record<string, string> = {
  "web-dev": "Web Development",
  cyber: "Cybersecurity",
  python: "Python & AI for Data",
  design: "UI/UX Design",
  data: "Data Analytics",
};

/** Humanised label for the awarded tier key the wire carries. */
export const SCHOLARSHIP_TIERS: Record<string, string> = {
  full: "Full scholarship",
  partial: "Partial scholarship",
  half: "Half scholarship",
};

/** A scholarship holder's dashboard tile payload. `null` when the
 *  application isn't at an awarded/enrolled stage. */
export type ScholarshipApplicationUi = ApiScholarshipApplication | null;

export type ScholarshipBannerUi = ApiScholarshipBanner;