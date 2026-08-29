import type { WireScholarshipApplication } from "@/lib/api/wire.types";

/**
 * smarthub-api shapes for the Tech Scholarship surface. Wire record
 * re-exported so scholarship-side code reads through the module seam.
 */
export type ApiScholarshipApplication = WireScholarshipApplication;

/** `GET /scholarship-applications/me/banner` — the share-ready asset
 *  bundle for the social milestone dialog. */
export interface ApiScholarshipBanner {
  squareUrl: string;
  wideUrl: string;
  generatedAt: string;
  suggestedCaption: string;
}

/** `PATCH /scholarship-applications/me/photo` — upload-persist the
 *  banner portrait. No crop in this slice (see plan 010). */
export type ApiUpdateScholarshipPhotoInput = {
  imageUrl: string;
};