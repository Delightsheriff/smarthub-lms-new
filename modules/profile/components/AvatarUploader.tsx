"use client";
import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downscaleImage } from "@/lib/image";
import { uploadFile } from "@/lib/api/client";
import { useUpdateMyDetails } from "../api/profile.queries";

interface AvatarUploaderProps {
  imageUrl: string | undefined;
  /** Fallback initial, e.g. the user's first-name initial. */
  initial: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
};

/**
 * Avatar pick → preview → downscale → upload (`/uploads` seam) → PATCH.
 * Removal clears the avatar via `imageUrl: ""`.
 */
export function AvatarUploader({
  imageUrl,
  initial,
  size = "lg",
  className,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const update = useUpdateMyDetails();
  const busy = update.isPending;

  const triggerPick = () => inputRef.current?.click();

  const onPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPEG or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large — keep it under 5 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const doUpload = async () => {
    if (!pendingFile) return;
    try {
      const downscaled = await downscaleImage(pendingFile);
      const url = await uploadFile(downscaled);
      await update.mutateAsync({ imageUrl: url });
      toast.success("Profile photo updated");
      setConfirmOpen(false);
    } finally {
      setPreview(null);
      setPendingFile(null);
    }
  };

  const doRemove = async () => {
    if (!imageUrl) return;
    try {
      await update.mutateAsync({ imageUrl: "" });
      toast.success("Profile photo removed");
      setRemoveOpen(false);
    } catch {
      /* interceptor toasts */
    }
  };

  return (
    <div className={`relative inline-flex ${className ?? ""}`}>
      <button
        type="button"
        onClick={triggerPick}
        className="group relative inline-flex rounded-full"
        aria-label="Change profile photo"
      >
        <Avatar className={`${SIZE_CLASSES[size]} ring-1 ring-border`}>
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt="Profile photo" />
          ) : null}
          <AvatarFallback>{initial || "?"}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
          <Camera className={size === "lg" || size === "xl" ? "h-6 w-6" : "h-4 w-4"} />
        </span>
      </button>

      {imageUrl ? (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => setRemoveOpen(true)}
          className="absolute -bottom-1 -right-1 rounded-full"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Preview photo</DialogTitle>
            <DialogDescription>
              Looks good? We&apos;ll downscale and update your profile photo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            {preview ? (
              <Avatar className="h-28 w-28 ring-1 ring-border">
                <AvatarImage src={preview} alt="Preview" />
                <AvatarFallback>{initial || "?"}</AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmOpen(false);
                setPreview(null);
                setPendingFile(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={doUpload}>
              {busy ? "Uploading…" : "Use this photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove profile photo?</DialogTitle>
            <DialogDescription>
              Your photo will be removed. You can upload a new one any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRemoveOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={busy} onClick={doRemove}>
              {busy ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
