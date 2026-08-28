/**
 * Map a mime type (or extension hint) to a sensible file extension.
 * Used by the Cloudinary download-URL helper so existing materials
 * downloaded via `fl_attachment` get the right filename suffix —
 * `report.pdf` instead of `report` — without the operator having to
 * re-upload.
 *
 * Keep the list narrow: only the types we actually accept via the
 * material upload mime allowlist. Unknown inputs return `undefined`
 * so the caller can decide whether to fall back to a generic
 * filename or leave the suffix off entirely.
 */

const MIME_TO_EXT: Record<string, string> = {
  // Documents
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "xlsx",
  // Images
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  // Video
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  // Audio
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  // Text / data
  "text/plain": "txt",
  "text/markdown": "md",
  "text/csv": "csv",
  "application/json": "json",
  "application/x-ipynb+json": "ipynb",
  // Archives
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

export function extensionForMime(input: string): string | undefined {
  if (!input) return undefined;
  const lc = input.toLowerCase().trim();
  // Direct mime hit
  if (MIME_TO_EXT[lc]) return MIME_TO_EXT[lc];
  // Operators sometimes paste plain extensions ("pdf", ".pdf",
  // "ipynb") into the File-type field — accept those too.
  const cleaned = lc.replace(/^\./, "");
  if (/^[a-z0-9]{2,5}$/.test(cleaned)) return cleaned;
  return undefined;
}
