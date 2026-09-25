"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Download,
  ImageUp,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { downloadFile } from "@/lib/cloudinary-download";
import {
  useRegenerateScholarshipBanner,
  useScholarshipBanner,
} from "../api/tech-scholarship.queries";
import { ScholarshipPhotoCropper } from "./ScholarshipPhotoCropper";
import { usePickedPhoto } from "./use-picked-photo";

/**
 * Share the scholarship milestone — a server-rendered banner (square for
 * posts, wide for link previews) plus an editable caption. Flow for a new
 * photo: pick → frame (round crop, zoom) → confirm → upload → the banner
 * refetches with the new face. Nothing uploads before the crop is
 * confirmed. The banner is only requested while the dialog is open.
 */
export function ShareMilestoneDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const bannerQuery = useScholarshipBanner({ enabled: open });
  const regenerate = useRegenerateScholarshipBanner();
  const fileRef = useRef<HTMLInputElement>(null);
  const openPicker = () => fileRef.current?.click();
  const photo = usePickedPhoto({
    onSaved: () => toast.success("Photo saved — your banner is updating."),
  });

  // null = untouched, so the suggestion shows; "" = the scholar cleared it.
  const [caption, setCaption] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const banner = bannerQuery.data;
  const captionValue = caption ?? banner?.suggestedCaption ?? "";
  // 409 = no photo on file yet (or not awarded) — the upload prompt, not
  // an error.
  const needsPhoto =
    bannerQuery.error instanceof ApiError && bannerQuery.error.status === 409;

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy — select the caption and copy it manually.");
    }
  };

  const shareUrl = (channel: "whatsapp" | "x") => {
    const text = `${captionValue}\n${banner?.squareUrl ?? ""}`;
    const encoded = encodeURIComponent(text);
    return channel === "whatsapp"
      ? `https://wa.me/?text=${encoded}`
      : `https://x.com/intent/post?text=${encoded}`;
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) photo.clear();
    onOpenChange(next);
  };

  let body: React.ReactNode;
  if (photo.pickedSrc) {
    body = (
      <ScholarshipPhotoCropper
        key={photo.pickedSrc}
        src={photo.pickedSrc}
        busy={photo.busy}
        onConfirm={(area) => void photo.confirm(area)}
        onChooseDifferent={openPicker}
        onCancel={photo.clear}
      />
    );
  } else if (bannerQuery.isLoading) {
    body = <Skeleton className="mx-auto aspect-square w-full max-w-60 rounded-xl" />;
  } else if (needsPhoto) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
        <ImageUp className="h-6 w-6 text-primary" aria-hidden />
        <p className="text-sm font-medium">Add a photo to generate your banner</p>
        <p className="text-xs text-muted-foreground">
          A clear, front-facing photo works best.
        </p>
        <Button onClick={openPicker}>Upload a photo</Button>
      </div>
    );
  } else if (bannerQuery.isError || !banner) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {bannerQuery.error?.message || "Couldn't prepare your banner."}
        </p>
        <Button variant="outline" size="sm" onClick={() => void bannerQuery.refetch()}>
          <RefreshCcw className="h-3.5 w-3.5" /> Try again
        </Button>
      </div>
    );
  } else {
    body = (
      <div className="space-y-4">
        <div className="relative mx-auto aspect-square w-full max-w-60 overflow-hidden rounded-xl border">
          <Image
            src={banner.squareUrl}
            alt="Your scholarship banner"
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              void downloadFile(banner.squareUrl, "smarthub-scholarship-square", "image/png")
            }
          >
            <Download className="h-4 w-4" /> Download square
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              void downloadFile(banner.wideUrl, "smarthub-scholarship-wide", "image/png")
            }
          >
            <Download className="h-4 w-4" /> Download wide
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={openPicker}>
            <ImageUp className="h-3.5 w-3.5" /> Change photo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={regenerate.isPending}
            onClick={() =>
              regenerate.mutate(undefined, {
                // The banner request is silent; surface this failure here.
                onError: (err) => toast.error(err.message || "Couldn't regenerate the banner."),
              })
            }
          >
            {regenerate.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Regenerate
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="share-caption">Caption</Label>
          <Textarea
            id="share-caption"
            value={captionValue}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            A sample — edit it to sound like you, but keep the hashtags.
          </p>
        </div>
      </div>
    );
  }

  const showShareActions = !photo.pickedSrc && !!banner;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share your milestone</DialogTitle>
          <DialogDescription>
            Download your banner, tweak the caption — then post it anywhere.
          </DialogDescription>
        </DialogHeader>

        {body}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          tabIndex={-1}
          aria-hidden
          onChange={photo.onFileChange}
        />

        {showShareActions && (
          <DialogFooter className="flex-wrap">
            <Button variant="outline" onClick={() => void copyCaption()}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy caption
                </>
              )}
            </Button>
            <Button
              nativeButton={false}
              render={<a href={shareUrl("whatsapp")} target="_blank" rel="noreferrer" />}
            >
              Share to WhatsApp
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={shareUrl("x")} target="_blank" rel="noreferrer" />}
            >
              Post on X
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
