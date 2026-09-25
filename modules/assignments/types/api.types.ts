import type { WireSubmission } from "@/lib/api/wire.types";

/**
 * smarthub-api submission shape (see `lib/api/wire.types.ts`). Uploads go
 * through `uploadFileDetailed` in lib/api, which owns the upload envelope.
 */
export type ApiSubmission = WireSubmission;
