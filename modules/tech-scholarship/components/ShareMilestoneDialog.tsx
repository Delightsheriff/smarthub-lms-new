"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Loader2,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useRegenerateScholarshipBanner,
  useScholarshipBanner,
  useUpdateScholarshipPhoto,
} from "../api/tech-scholarship.queries";

/** Share the scholarship milestone — banner + editable caption, ready
 *  to post on WhatsApp / X. Regenerating gives a fresh asset; uploading
 *  a photo persists it (no crop in this slice). */
export function ShareMilestoneDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useScholarshipBanner();
  const regenerate = useRegenerateScholarshipBanner();
  const photo = useUpdateScholarshipPhoto();

  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const banner = data && (regenerate.data ?? data);
  const suggested = (banner && banner.suggestedCaption) ?? "";
  const captionValue = caption || suggested;

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is unavailable/sandboxed — surface the caption so the
      // student can copy it by selecting the text.
      setCopied(false);
    }
  };

  const shareUrl = (channel: "whatsapp" | "x") => {
    const asset = banner?.squareUrl ?? "";
    const text = `${captionValue}\n${asset}`;
    const encoded = encodeURIComponent(text);
    return channel === "whatsapp"
      ? `https://wa.me/?text=${encoded}`
      : `https://x.com/intent/post?text=${encoded}`;
  };

  const pickPhoto = async (file: File | null) => {
    if (!file) return;
    try {
      await photo.mutateAsync(file);
      regenerate.mutate();
    } catch {
      // Interceptor toasts the error; keep the dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share your milestone</DialogTitle>
          <DialogDescription>
            Regenerate the banner, tweak the caption — then post it
            anywhere.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && <Skeleton className="h-40 w-full rounded-xl" />}

          {banner && (
            <div className="grid grid-cols-[120px_1fr] gap-4">
              <Image
                src={banner.wideUrl}
                alt="Scholarship banner"
                width={240}
                height={120}
                className="w-full rounded-lg border object-cover"
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Banner ready — regenerating gives you a fresh look.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={regenerate.isPending}
                  onClick={() => regenerate.mutate()}
                >
                  {regenerate.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Regenerate
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="share-caption">Caption</Label>
            <Textarea
              id="share-caption"
              value={captionValue}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
            <p className="text-right text-xs text-muted-foreground">
              {captionValue.length} characters
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="share-photo"
              className="block cursor-pointer rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground hover:border-primary/40"
            >
              <UploadCloud className="mx-auto mb-1 h-4 w-4" />
              Optional — add your photo
              <Input
                id="share-photo"
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void pickPhoto(e.target.files?.[0] ?? null)}
              />
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-wrap">
          <Button variant="outline" onClick={copyCaption}>
            {copied ? (
              <span className="text-success">Copied</span>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy caption
              </>
            )}
          </Button>
          <Button
            render={<a href={shareUrl("whatsapp")} target="_blank" rel="noreferrer" />}
          >
            Share to WhatsApp
          </Button>
          <Button
            variant="outline"
            render={<a href={shareUrl("x")} target="_blank" rel="noreferrer" />}
          >
            Post on X
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}