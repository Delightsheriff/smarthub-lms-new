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
  suggestedCaption?: string;
}

/** `PATCH /scholarship-applications/me/photo` — persist the (cropped,
 *  already-uploaded) banner portrait. The API also stores it as the
 *  user's `imageUrl`. */
export type ApiUpdateScholarshipPhotoInput = {
  imageUrl: string;
};