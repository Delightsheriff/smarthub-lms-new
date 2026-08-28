/**
 * Client-side image downscaling for avatar / photo uploads.
 *
 * Phone cameras hand us 2–8 MB JPEGs. An avatar is displayed at ~160 px,
 * so shipping the raw file wastes bandwidth and — more importantly — is
 * the difference between an upload that sails through and one that dies
 * with a bare "Network Error": payloads that big can trip a reverse-proxy
 * body-size cap or time out on a weak mobile connection before the API
 * ever sees them. Re-encoding to a capped-dimension JPEG turns a 2.7 MB
 * photo into ~100 KB, well under any such ceiling.
 *
 * Best-effort by design: if anything about the decode/encode fails
 * (undecodable format, tainted canvas, missing API) we return the
 * ORIGINAL file untouched, so compression can never itself block an
 * upload the user could otherwise complete.
 */

interface DownscaleOptions {
  /** Longest edge of the output, in pixels. Smaller images are left as-is. */
  maxDim?: number;
  /** JPEG quality 0–1. */
  quality?: number;
}

interface Drawable {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

const loadDrawable = async (file: File): Promise<Drawable> => {
  // createImageBitmap is fast and — with imageOrientation:'from-image' —
  // bakes in EXIF rotation so portrait phone shots don't upload sideways.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fall through to the <img> path.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      cleanup: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
};

/**
 * Return a downscaled JPEG `File` for upload, or the original file if it
 * can't be processed or wouldn't get smaller.
 */
export async function downscaleImage(
  file: File,
  { maxDim = 1024, quality = 0.85 }: DownscaleOptions = {}
): Promise<File> {
  // Only touch raster photos. GIF (may be animated) and SVG (vector) would
  // be corrupted by a canvas round-trip, so leave them alone.
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  let drawable: Drawable | null = null;
  try {
    drawable = await loadDrawable(file);
    const { source, width, height } = drawable;
    if (!width || !height) return file;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    // If re-encoding didn't actually shrink it (already tiny/optimised),
    // keep the original so we never make things worse.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    drawable?.cleanup();
  }
}
