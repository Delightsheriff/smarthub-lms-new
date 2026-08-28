"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Link as LinkIcon,
  Lock,
  Notebook,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import { RecordingPlayerDialog } from "./recording-player-dialog";
import { MaterialPreviewDialog } from "./material-preview-dialog";
import { useTrackMaterialDownload } from "@/modules/learning/api/content.queries";
import { downloadFile } from "@/lib/cloudinary-download";
import type { Material, Recording } from "@/modules/learning/types";
import type { Assignment } from "@/modules/assignments/types";

const MATERIAL_ICON: Record<Material["type"], React.ElementType> = {
  pdf: FileText,
  slide: Notebook,
  exercise: Notebook,
  link: LinkIcon,
};

const STATUS_VARIANT: Record<
  Assignment["status"],
  "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
> = {
  draft: "secondary",
  submitted: "outline",
  graded: "default",
  overdue: "destructive",
  returned: "secondary",
};

const STATUS_LABEL: Record<Assignment["status"], string> = {
  draft: "Not started",
  submitted: "Submitted",
  graded: "Graded",
  overdue: "Overdue",
  returned: "Returned",
};

/**
 * One lane of content inside a single-module page (Recordings,
 * Materials, or Assignments). Each section is rendered as the body of
 * a tab on the module page; the tab label provides the heading. Item
 * ids are stable hash anchors so the outline side-nav can deep-link.
 */

export function RecordingsSection({ items }: { items: Recording[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Guard: a locked recording can never become the active player target.
  const active =
    items.find((r) => r.id === activeId && !r.isLocked) || null;

  if (items.length === 0) return <EmptyState label="No recordings yet" />;

  return (
    <>
      <ul className="divide-y rounded-2xl border bg-card">
        {items.map((r) => {
          const locked = r.isLocked;
          const open = () => {
            if (!locked) setActiveId(r.id);
          };
          return (
            <li
              key={r.id}
              id={`recording-${r.id}`}
              className={cn(
                "scroll-mt-24 flex items-start gap-3 px-4 py-3",
                locked && "opacity-60",
              )}
            >
              {/* Dedicated play target. Splitting the row into a play
                  button + a non-button description container keeps
                  links inside the description clickable. */}
              {locked ? (
                <span
                  className="shrink-0 mt-0.5 p-0.5 text-muted-foreground"
                  aria-hidden
                >
                  <Lock className="h-5 w-5" />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={open}
                  aria-label={`Play ${r.title}`}
                  className="shrink-0 mt-0.5 rounded-full text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors p-0.5"
                >
                  {r.watched ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <PlayCircle className="h-5 w-5" />
                  )}
                </button>
              )}
              <div className="min-w-0 flex-1">
                {locked ? (
                  <p className="text-left text-sm font-medium leading-tight text-muted-foreground">
                    {r.title}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={open}
                    className="text-left text-sm font-medium leading-tight hover:text-primary transition-colors"
                  >
                    {r.title}
                  </button>
                )}
                {locked ? (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Not available to you
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.durationLabel} · published {formatDate(r.publishedAt)}
                  </p>
                )}
                {!locked && r.description && (
                  // HTML from the admin's TipTap editor. Outside the
                  // play target so links inside it are clickable.
                  <div className="mt-2 text-xs text-muted-foreground">
                    <CollapsibleRichText html={r.description} maxHeight={72} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <RecordingPlayerDialog
        recording={active}
        open={!!active}
        onOpenChange={(o) => {
          if (!o) setActiveId(null);
        }}
      />
    </>
  );
}

export function MaterialsSection({ items }: { items: Material[] }) {
  const trackDownload = useTrackMaterialDownload();
  const [previewing, setPreviewing] = useState<{
    title: string;
    url: string;
    fileType?: string;
  } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) return <EmptyState label="No materials yet" />;

  const openPreview = (m: Material, url: string, label?: string) => {
    trackDownload.mutate(m.id);
    setPreviewing({
      title: label ? `${m.title} — ${label}` : m.title,
      url,
      fileType: m.fileType,
    });
  };

  return (
    <>
      <ul className="divide-y rounded-2xl border bg-card">
        {items.map((m) => {
          const Icon = MATERIAL_ICON[m.type];
          const links = m.links;
          const hasFile = links.length > 0;
          // Several named files/links → the row expands to list them
          // instead of opening one, since there's no single "the file".
          const multiFile = links.length > 1;
          const hasBody = !!m.description;
          // Instructions-only material → click expands the body inline.
          const instructionsOnly = !hasFile && hasBody;
          const expandable = instructionsOnly || multiFile;
          const expanded = expandedId === m.id;
          return (
            <li key={m.id} id={`material-${m.id}`} className="scroll-mt-24">
              <button
                type="button"
                onClick={() => {
                  if (expandable) {
                    setExpandedId(expanded ? null : m.id);
                  } else if (links[0]) {
                    openPreview(m, links[0].url);
                  }
                }}
                disabled={!hasFile && !instructionsOnly}
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">
                    {m.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {multiFile
                      ? `${links.length} files`
                      : m.size || (instructionsOnly ? "Guide" : null)}
                  </p>
                </div>
                {multiFile || instructionsOnly ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">
                    {expanded ? "Hide" : multiFile ? "Open" : "Read"}
                  </span>
                ) : hasFile ? (
                  <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : null}
              </button>

              {/* Body: shown inline for instructions-only materials (click
                  to expand). For file-backed materials with a description,
                  surface it below the row in a compact read-only view. */}
              {(hasBody || multiFile) && (expandable ? expanded : true) && (
                <div className="border-t border-border bg-muted/20 px-4 py-3">
                  {hasBody && (
                    <CollapsibleRichText
                      html={m.description}
                      maxHeight={expandable ? 9999 : 88}
                    />
                  )}
                  {hasFile && (
                    <div className={hasBody ? "mt-3 space-y-2" : "space-y-2"}>
                      {links.map((link, i) => (
                        <div
                          key={`${link.url}-${i}`}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1"
                        >
                          {multiFile && (
                            <span className="text-xs font-medium text-foreground">
                              {link.name || `Link ${i + 1}`}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(
                                m,
                                link.url,
                                multiFile ? link.name : undefined,
                              );
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Eye className="h-3 w-3" /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void downloadFile(
                                link.url,
                                multiFile && link.name
                                  ? `${m.title} — ${link.name}`
                                  : m.title,
                                m.fileType,
                              );
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {previewing && (
        <MaterialPreviewDialog
          open={!!previewing}
          onOpenChange={(o) => !o && setPreviewing(null)}
          title={previewing.title}
          url={previewing.url}
          fileType={previewing.fileType}
        />
      )}
    </>
  );
}

export function AssignmentsSection({
  items,
  courseSlug,
  moduleSlug,
}: {
  items: Assignment[];
  /** Required to build the Open link to
   *  /courses/[slug]/modules/[moduleSlug]/assignments/[id]. */
  courseSlug: string;
  moduleSlug: string;
}) {
  if (items.length === 0) return <EmptyState label="No assignments yet" />;

  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {items.map((a) => (
        <li key={a.id} id={`assignment-${a.id}`} className="scroll-mt-24">
          <Link
            href={`/courses/${courseSlug}/modules/${moduleSlug}/assignments/${a.id}`}
            className="group flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/60 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                {a.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Due {formatDate(a.dueAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={STATUS_VARIANT[a.status]}>
                {STATUS_LABEL[a.status]}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                Open
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-2xl">
      {label}
    </p>
  );
}
