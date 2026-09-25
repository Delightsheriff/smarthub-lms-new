"use client";
import { useRef } from "react";
import { ImageUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/slices/authStore";
import { useMyScholarship } from "../api/tech-scholarship.queries";
import { ScholarshipPhotoCropper } from "./ScholarshipPhotoCropper";
import { usePickedPhoto } from "./use-picked-photo";

/**
 * Compulsory photo gate for awarded scholars. An awarded scholar with no
 * photo on file gets a non-dismissable dialog (no close button; Escape
 * and outside clicks are ignored because there's no `onOpenChange`) until
 * they frame and upload one — it powers their share banner. The upload
 * becomes `User.imageUrl`, which the mutation mirrors into the auth store,
 * closing the gate.
 *
 * Students are skipped: `ProfilePhotoGate` already blocks every student
 * without a photo (legacy made that gate supersede this one for them), and
 * two stacked blocking dialogs would fight for focus. This covers awarded
 * scholars who aren't on a student role yet.
 */
export function ScholarshipPhotoGate() {
  const user = useAuthStore((s) => s.user);
  const hasPhoto = !!user?.imageUrl?.trim();
  const isStudent = (user?.roles ?? []).includes("student");
  // Skip the request entirely for anyone who can't be gated.
  const eligible = !!user && !hasPhoto && !isStudent;
  const scholarship = useMyScholarship({ enabled: eligible });

  const fileRef = useRef<HTMLInputElement>(null);
  const openPicker = () => fileRef.current?.click();
  const photo = usePickedPhoto({
    onSaved: () => toast.success("Photo saved — you're all set!"),
  });

  // Only gate once the scholarship status is known, so the dialog never
  // flashes before the query settles.
  const open =
    eligible && scholarship.isSuccess && !!scholarship.data?.awardedTier;

  if (!open) return null;

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] max-w-md overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Add your profile photo to continue</DialogTitle>
          <DialogDescription>
            Every scholar needs a photo on file — it powers the banner you
            share to tell your SmartHub story.
          </DialogDescription>
        </DialogHeader>

        {photo.pickedSrc ? (
          <ScholarshipPhotoCropper
            key={photo.pickedSrc}
            src={photo.pickedSrc}
            busy={photo.busy}
            onConfirm={(area) => void photo.confirm(area)}
            onChooseDifferent={openPicker}
            onCancel={photo.clear}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
            <ImageUp className="h-6 w-6 text-primary" aria-hidden />
            <p className="text-xs text-muted-foreground">
              A clear, front-facing photo works best.
            </p>
            <Button onClick={openPicker} disabled={photo.busy}>
              Upload a photo
            </Button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          tabIndex={-1}
          aria-hidden
          onChange={photo.onFileChange}
        />
      </DialogContent>
    </Dialog>
  );
}
