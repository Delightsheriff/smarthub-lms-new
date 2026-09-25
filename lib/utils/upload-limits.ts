/**
 * Client-side mirror of the API's upload caps. Multer allows 25 MB
 * overall, but Cloudinary caps `raw` assets (PDFs, notebooks, archives,
 * office docs) at 10 MB — so an oversize document is caught here instead
 * of failing after the whole upload round-trip.
 */
export const RAW_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_MAX_BYTES = 25 * 1024 * 1024;

export function maxUploadBytesFor(file: { type: string }): number {
  return /^(image|video|audio)\//.test(file.type)
    ? MEDIA_MAX_BYTES
    : RAW_MAX_BYTES;
}

/** Null when the file fits, otherwise a user-facing reason. */
export function uploadSizeError(file: { type: string; size: number }): string | null {
  const cap = maxUploadBytesFor(file);
  return file.size > cap
    ? `File is larger than ${Math.round(cap / (1024 * 1024))} MB.`
    : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
