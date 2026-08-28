/**
 * Download a remote file with a chosen filename.
 *
 * Why this exists: materials uploaded before the API upload-stream
 * fix were stored on Cloudinary without a filename extension. A plain
 * `<a href={url}>` download produces a save dialog that defaults to
 * the URL's last path segment (`py4julttlfumd800gmhj`) with no
 * extension, and PDF viewers reject the saved file as corrupted.
 *
 * Cloudinary's `fl_attachment:<filename>` URL transformation is the
 * obvious fix but it returns 400 for `raw` resource types (PDFs,
 * docs, notebooks) — they're delivered without a transformation
 * pipeline. The cross-origin `<a download="...">` attribute is
 * silently ignored by Chrome for security reasons.
 *
 * So: fetch the file as a Blob, build an object URL, and trigger a
 * download via a synthetic `<a>` click. Cloudinary serves with
 * permissive CORS headers so the fetch succeeds; the browser uses
 * the `download` attribute on the synthetic link (which IS honoured
 * for blob: URLs, regardless of source origin).
 *
 * Falls back to a normal `window.open` for non-fetchable URLs (e.g.
 * Google Drive — opaque cross-origin) so existing behaviour is
 * preserved there.
 */

import { extensionForMime } from "./mime-extension";

/**
 * Save an in-memory Blob to disk under a chosen filename.
 *
 * Split out of `downloadFile` because bytes now reach us two ways:
 * a cross-origin fetch of a Cloudinary asset, and an authenticated
 * `apiClient.getBlob` of something the API renders on demand. The
 * synthetic-anchor dance is identical either way.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Release the blob handle once the browser has had a chance to
  // start the download. 60s window is generous — most browsers
  // commit the handle within ms but some queue.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function downloadFile(
  url: string | undefined | null,
  title: string,
  fileType?: string
): Promise<void> {
  if (!url) return;

  // Non-Cloudinary URLs (Google Drive, S3, external links) can't
  // reliably be fetched cross-origin — open in a new tab instead so
  // the user gets the file via the host's own UI.
  if (!url.includes("res.cloudinary.com")) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const filename = buildFilename(title, fileType);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    triggerBlobDownload(await response.blob(), filename);
  } catch {
    // If the blob fetch fails for any reason, fall back to opening
    // the URL in a new tab. Worst case: the user gets the file with
    // a Cloudinary slug as the filename, but they get the file.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function buildFilename(title: string, fileType?: string): string {
  const ext = fileType ? extensionForMime(fileType) : undefined;
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "file";
  return ext ? `${base}.${ext}` : base;
}

/**
 * Returns the raw URL as-is. Kept as a no-op for back-compat with
 * existing call sites that imported `cloudinaryDownloadUrl`. The
 * `fl_attachment` transformation it used to apply produces 400 for
 * `raw` resource types — see `downloadFile` above for the working
 * replacement.
 *
 * @deprecated Use `downloadFile` for explicit downloads.
 */
export function cloudinaryDownloadUrl(
  url: string | undefined | null
): string {
  return url || "";
}
