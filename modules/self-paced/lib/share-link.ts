import { publicSiteOrigin } from "@/lib/public-origin";
import type { InstructorLink } from "../types/instructor.types";

/**
 * Where an instructor's referral link points: the course's page on the
 * PUBLIC site with `?ref=CODE` — the buyer isn't in the LMS yet, and the
 * public site carries the code through checkout into the order's
 * attribution.
 *
 * Built from the same public-origin resolution as every other link that
 * leaves the LMS. The API's own `shareUrl` (from its CLIENT_URL) is only
 * the fallback for a link whose course has no slug to build from.
 */
export function referralShareUrl(link: InstructorLink): string {
  const slug = link.course?.slug;
  if (!slug) return link.shareUrl ?? "";
  return `${publicSiteOrigin()}/courses/${encodeURIComponent(slug)}?ref=${encodeURIComponent(link.code)}`;
}
