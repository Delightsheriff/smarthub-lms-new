"use client";
import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Check, ImageUp, Loader2, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The frame step shared by the photo gate and the share dialog: drag to
 * reposition, zoom, round crop that matches the banner's circular photo
 * slot. Nothing uploads until the scholar presses "Use this photo" — the
 * parent owns the upload and passes `busy` while it runs.
 */
export function ScholarshipPhotoCropper({
  src,
  busy,
  onConfirm,
  onChooseDifferent,
  onCancel,
}: {
  src: string;
  busy: boolean;
  onConfirm: (areaPixels: Area) => void;
  onChooseDifferent: () => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-square w-full max-w-60 overflow-hidden rounded-xl border bg-muted">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, pixels) => setAreaPixels(pixels)}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Drag to reposition. This is the circle that appears on your banner.
      </p>
      <div className="flex items-center gap-2 px-1">
        <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="h-1.5 w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => areaPixels && onConfirm(areaPixels)}
          disabled={busy || !areaPixels}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {busy ? "Uploading…" : "Use this photo"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onChooseDifferent}
          disabled={busy}
        >
          <ImageUp className="h-4 w-4" /> Choose different
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}
