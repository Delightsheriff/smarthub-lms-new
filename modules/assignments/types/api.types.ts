import type { WireSubmission } from "@/lib/api/wire.types";

/**
 * smarthub-api submission shape (see `lib/api/wire.types.ts`), plus the
 * upload response the assignment-file upload endpoint returns.
 */
export type ApiSubmission = WireSubmission;

export interface ApiUploadResponse {
  url: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}
