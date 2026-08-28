"use client";
import { useMemo } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreviewableUrl } from "../hooks/use-previewable-url";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  /** MIME / extension hint. Used to pick the in-app viewer (PDF
   *  iframe, image tag, video tag, Office-via-Google-Docs-Viewer,
   *  or plain "open externally" fallback). Also passed to the
   *  blob-fetch path so the iframe gets the right Content-Type for
   *  extensionless Cloudinary URLs. */
  fileType?: string;
}

type PreviewKind =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "office"
  | "iframe-text"
  | "external";

/**
 * Inline preview for course materials. PDFs + images + videos render
 * natively in an iframe / img / video tag. Office docs (docx, pptx,
 * xlsx) render via Google Docs Viewer. Anything else falls back to an
 * "Open externally" CTA.
 *
 * For Cloudinary URLs, the preview source is rewritten to a `blob://`
 * URL via `usePreviewableUrl` so old extensionless uploads (stored
 * with `Content-Type: application/octet-stream`) still render — the
 * blob is built with the explicit mime from our DB instead of
 * inheriting Cloudinary's broken header.
 *
 * Office docs are the exception — Google Docs Viewer fetches the
 * source URL itself, so it needs the original Cloudinary URL (the
 * viewer can't reach a `blob://` from our origin).
 */
export function MaterialPreviewDialog({
  open,
  onOpenChange,
  title,
  url,
  fileType,
}: Props) {
  const kind = useMemo(() => detectKind(url, fileType), [url, fileType]);

  // Only blob-wrap for kinds we render in-app. Office docs hand the
  // URL off to a third-party viewer, so they need the original.
  const needsBlob =
    kind === "pdf" ||
    kind === "image" ||
    kind === "video" ||
    kind === "audio" ||
    kind === "iframe-text";
  const blob = usePreviewableUrl(
    needsBlob && open ? url : undefined,
    fileType,
  );
  const renderUrl = needsBlob ? blob.url : url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-5 py-3 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
          <DialogTitle className="text-base truncate">{title}</DialogTitle>
          {/* "Open in new tab" uses the original URL — opening a
              blob:// URL in a new tab is jarring (the address bar
              shows `blob:https://…` and the page closes on tab close). */}
          <Button
            variant="outline"
            size="sm"
            render={<a href={url} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open in new tab
          </Button>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto bg-muted/30">
          {needsBlob && blob.loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading preview…</p>
            </div>
          ) : (
            <PreviewBody kind={kind} url={renderUrl} title={title} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewBody({
  kind,
  url,
  title,
}: {
  kind: PreviewKind;
  url: string;
  title: string;
}) {
  switch (kind) {
    case "pdf":
      return (
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
        />
      );
    case "image":
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    case "video":
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <video
            src={url}
            controls
            className="max-w-full max-h-full"
          />
        </div>
      );
    case "audio":
      return (
        <div className="w-full h-full flex items-center justify-center p-6">
          <audio src={url} controls className="w-full max-w-md" />
        </div>
      );
    case "office":
      return (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
          title={title}
          className="w-full h-full border-0"
        />
      );
    case "iframe-text":
      return (
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0 bg-background"
        />
      );
    case "external":
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No inline preview for this file type</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Open it in a new tab to view or download.
          </p>
          <Button
            className="mt-4"
            render={<a href={url} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Open in new tab
          </Button>
        </div>
      );
  }
}

/**
 * Decide which viewer to use. Reads explicit MIME / extension hints
 * first, then falls back to the URL's extension. Trailing query
 * strings on Cloudinary URLs (e.g. `?v=…`) are ignored.
 */
function detectKind(url: string, fileType?: string): PreviewKind {
  const lc = (fileType || "").toLowerCase();

  if (lc.includes("pdf")) return "pdf";
  if (lc.startsWith("image/") || /\b(png|jpe?g|gif|webp|svg)\b/.test(lc))
    return "image";
  if (lc.startsWith("video/") || /\b(mp4|webm|mov|m4v)\b/.test(lc))
    return "video";
  if (lc.startsWith("audio/") || /\b(mp3|wav|m4a|aac|ogg)\b/.test(lc))
    return "audio";
  if (/\b(docx?|pptx?|xlsx?)\b/.test(lc)) return "office";
  if (/\b(md|markdown|txt|csv|json)\b/.test(lc)) return "iframe-text";

  // Fall back to URL extension parsing.
  const cleanUrl = url.split("?")[0]?.split("#")[0] || "";
  const ext = cleanUrl.includes(".")
    ? cleanUrl.split(".").pop()?.toLowerCase()
    : undefined;
  if (!ext) return "external";

  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return "image";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a", "aac", "ogg"].includes(ext)) return "audio";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext))
    return "office";
  if (["md", "markdown", "txt", "csv", "json"].includes(ext))
    return "iframe-text";

  return "external";
}
