/**
 * Render a selected crop region to a square JPEG Blob. `react-easy-crop`
 * reports the crop rectangle in natural-image pixels; we draw exactly that
 * rectangle onto a canvas and export it, so what the user framed is what
 * gets uploaded.
 *
 * JPEG, not PNG: a photographic 800px PNG runs ~1 MB — big enough to trip
 * a proxy body cap or a mobile timeout. The same crop as JPEG is ~80 KB
 * with no visible quality loss for a photo.
 */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error("Could not read that image.")),
    );
    img.setAttribute("crossOrigin", "anonymous");
    img.src = src;
  });
}

/**
 * @param src        object URL of the picked file
 * @param crop       crop rect in natural pixels (from `onCropComplete`)
 * @param outputSize edge length of the exported square (default 800)
 */
export async function getCroppedBlob(
  src: string,
  crop: PixelCrop,
  outputSize = 800,
): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");

  canvas.width = outputSize;
  canvas.height = outputSize;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the cropped image."));
      },
      "image/jpeg",
      0.9,
    );
  });
}

/** Crop, then wrap as a `File` ready for `uploadFile`. */
export async function getCroppedFile(
  src: string,
  crop: PixelCrop,
  filename = "photo.jpg",
): Promise<File> {
  const blob = await getCroppedBlob(src, crop);
  return new File([blob], filename, { type: "image/jpeg" });
}
