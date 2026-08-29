"use client";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/slices/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downscaleImage } from "@/lib/image";
import { uploadFile } from "@/lib/api/client";
import { useUpdateMyDetails } from "../api/profile.queries";

/**
 * Shell gate for students without a profile photo. Non-dismissable until
 * a photo is uploaded — after upload it mirrors the URL into the store so
 * the gate closes immediately.
 */
export function ProfilePhotoGate() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const update = useUpdateMyDetails();

  const isStudent = (user?.roles ?? []).includes("student");
  const hasPhoto = !!user?.imageUrl?.trim();
  const open = !!user && isStudent && !hasPhoto;

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large — keep it under 5 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const downscaled = await downscaleImage(file);
      const url = await uploadFile(downscaled);
      await update.mutateAsync({ imageUrl: url });
      if (user) setUser({ ...user, imageUrl: url });
      toast.success("Profile photo added");
    } catch {
      // interceptor toasts
    } finally {
      setPreview(null);
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add a profile photo</DialogTitle>
          <DialogDescription>
            Add a photo to your profile before you continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <Avatar className="h-24 w-24 ring-1 ring-border">
            {preview ? <AvatarImage src={preview} alt="Preview" /> : null}
            <AvatarFallback className="text-3xl">
              {user?.firstName?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" /> {busy ? "Uploading…" : "Choose a photo"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
