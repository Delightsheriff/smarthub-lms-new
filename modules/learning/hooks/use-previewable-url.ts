"use client";
import { useEffect, useState } from "react";

/**
 * Resolve a "previewable" URL from a potentially extensionless
 * Cloudinary URL.
 *
 * Background: materials uploaded before the API upload-stream fix
 * landed on Cloudinary without a filename extension. Cloudinary then
 * serves them with `Content-Type: application/octet-stream` instead
 * of `application/pdf` (or whatever the file actually is) — browsers
 * refuse to render those inline in an iframe / img / video tag, so
 * the preview dialog blanks out.
 *
 * Fix: fetch the file via JS (Cloudinary serves with permissive CORS),
 * wrap the bytes in a Blob with the **correct** mime type from our
 * DB, hand back a `blob://` URL. The browser uses the Blob's `type`
 * to pick the right viewer, regardless of the original server's
 * Content-Type header.
 *
 * Non-Cloudinary URLs pass through unchanged. Loading / error states
 * surface so callers can render a placeholder while the blob is
 * being fetched.
 */
export interface PreviewableUrl {
  /** The URL to feed into the iframe / img / video src. */
  url: string;
  /** True while the blob is being fetched. Callers should show a
   *  loading placeholder. */
  loading: boolean;
  /** True when fetch failed and we fell back to the original URL —
   *  preview may render badly (e.g. octet-stream PDF). Callers can
   *  surface an "open externally" CTA in that case. */
  error: boolean;
}

interface BlobState {
  /** The URL this blob was fetched for — lets render derivation tell a
   *  stale blob from the current `url` without a sync setState reset. */
  forUrl: string;
  blobUrl: string;
  error: boolean;
}

/**
 * @param url Source URL. Cloudinary URLs get blob-wrapped; others
 *   pass through.
 * @param mimeType Override the Blob's `type`. Critical for the
 *   correct-viewer dispatch — we use the DB-stored `fileType`, not
 *   whatever Cloudinary claims.
 */
export function usePreviewableUrl(
  url: string | undefined,
  mimeType?: string,
): PreviewableUrl {
  const [blob, setBlob] = useState<BlobState | null>(null);

  // The pass-through case (no URL, or a non-Cloudinary URL) needs no
  // state at all — it's derivable straight from the props, so we never
  // setState synchronously in the effect (react-hooks/set-state-in-effect).
  const passthrough = !url || !url.includes("res.cloudinary.com");

  useEffect(() => {
    // Only Cloudinary URLs need the blob-wrap. For everything else the
    // render derivation already returns the raw URL pass-through.
    if (passthrough || !url) return;

    let active = true;
    let objectUrl: string | null = null;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const raw = await response.blob();
        // Re-wrap with the explicit mime when we have one. This is
        // the line that fixes preview for old extensionless URLs —
        // without it the iframe inherits Cloudinary's
        // octet-stream and refuses to render.
        const typed = mimeType
          ? new Blob([raw], { type: mimeType })
          : raw;
        return URL.createObjectURL(typed);
      })
      .then(
        (createdUrl) => {
          if (!active) {
            URL.revokeObjectURL(createdUrl);
            return;
          }
          objectUrl = createdUrl;
          setBlob({ forUrl: url, blobUrl: createdUrl, error: false });
        },
        () => {
          // Fall back to the raw URL — preview may still work for some
          // file types (browser sniffing) and the caller can offer an
          // "open externally" CTA. We record only the failure to allow a
          // loading → error transition without a blob.
          if (active) setBlob({ forUrl: url, blobUrl: url, error: true });
        },
      );

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, mimeType, passthrough]);

  if (passthrough) {
    return { url: url || "", loading: false, error: false };
  }

  // A Cloudinary URL with no matching blob yet (or a stale blob from a
  // previous URL) means we're still fetching → loading state.
  if (!blob || blob.forUrl !== url) {
    return { url: url || "", loading: true, error: false };
  }

  return { url: blob.blobUrl, loading: false, error: blob.error };
}
