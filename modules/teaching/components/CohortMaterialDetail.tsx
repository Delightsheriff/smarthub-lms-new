"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { downloadFile } from "@/lib/cloudinary-download";
import { MaterialPreviewDialog } from "@/modules/learning/components/material-preview-dialog";
import {
  useDeleteTeachingContent,
  useTeachingMaterial,
} from "../api/teaching.queries";
import {
  AuthoringLoadError,
  AuthoringShell,
  AuthoringSkeleton,
  ConfirmDialog,
  errorText,
} from "./authoring/authoring-kit";

/**
 * Instructor view of one material: the guide body, the file (preview /
 * download) and its links, with Edit and Delete. Delete removes the
 * material from every cohort, so the confirm says so.
 */
export function CohortMaterialDetail({
  scheduleId,
  materialId,
}: {
  scheduleId: string;
  materialId: string;
}) {
  const router = useRouter();
  const material = useTeachingMaterial(materialId);
  const del = useDeleteTeachingContent();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cohortHref = `/teach/cohorts/${scheduleId}?tab=modules`;

  if (material.isLoading) return <AuthoringSkeleton />;
  if (material.isError || !material.data) {
    return (
      <AuthoringLoadError
        message="Couldn't load this material."
        backHref={cohortHref}
        onRetry={() => material.refetch()}
      />
    );
  }

  const m = material.data;
  const links = m.links?.length
    ? m.links
    : m.fileUrl
      ? [{ name: m.title, url: m.fileUrl }]
      : [];

  const onDelete = async () => {
    try {
      await del.mutateAsync({ kind: "material", id: materialId });
      toast.success("Material deleted");
      router.replace(cohortHref);
    } catch (err) {
      toast.error(errorText(err, "Couldn't delete the material."));
    }
  };

  return (
    <AuthoringShell
      backHref={cohortHref}
      backLabel="Back to cohort"
      title={m.title}
      description={
        <span className="flex flex-wrap items-center gap-1.5">
          {m.category && (
            <Badge variant="secondary" className="capitalize">
              {m.category}
            </Badge>
          )}
          <Badge variant={m.isPublic === false ? "outline" : "success"}>
            {m.isPublic === false ? "Hidden from students" : "Visible to students"}
          </Badge>
          {m.fileType && (
            <Badge variant="outline" className="font-mono uppercase">
              {m.fileType}
            </Badge>
          )}
        </span>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href={`/teach/cohorts/${scheduleId}/materials/${materialId}/edit`} />
          }
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Delete
        </Button>
      </div>

      {m.fileUrl && (
        <section className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{m.title}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">
              {m.fileType || "File"}
            </p>
          </div>
          <Button size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void downloadFile(m.fileUrl as string, m.title, m.fileType)}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Download
          </Button>
        </section>
      )}

      {links.length > 1 && (
        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-semibold">Links</h2>
          <ul className="divide-y divide-border">
            {links.map((l, i) => (
              <li key={`${l.url}-${i}`}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
                >
                  <span className="truncate">{l.name || `Link ${i + 1}`}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold">{m.fileUrl ? "Notes" : "Guide"}</h2>
        {m.description ? (
          <RichText html={m.description} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {m.fileUrl
              ? "No notes alongside the file."
              : "This material has neither a file nor a guide yet."}
          </p>
        )}
      </section>

      {m.fileUrl && (
        <MaterialPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={m.title}
          url={m.fileUrl}
          fileType={m.fileType}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this material?"
        description={
          <>
            <strong>{m.title}</strong> will be removed from its module in every
            cohort, not just this one. Anyone with the file link saved elsewhere
            may still reach the file.
          </>
        }
        confirmLabel="Delete material"
        pending={del.isPending}
        onConfirm={onDelete}
      />
    </AuthoringShell>
  );
}
