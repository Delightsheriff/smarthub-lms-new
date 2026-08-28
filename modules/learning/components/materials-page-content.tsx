"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  FileText,
  Library,
  Link as LinkIcon,
  Notebook,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import { MaterialPreviewDialog } from "./material-preview-dialog";
import { useMyMaterials, useTrackMaterialDownload } from "../api/content.queries";
import { downloadFile } from "@/lib/cloudinary-download";
import type { Material, MaterialWithContext } from "../types";

const MATERIAL_ICON: Record<Material["type"], React.ElementType> = {
  pdf: FileText,
  slide: Notebook,
  exercise: Notebook,
  link: LinkIcon,
};

type Filter = "all" | "files" | "guides";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "files", label: "Files" },
  { value: "guides", label: "Guides" },
];

/** Cross-course "All materials" surface. Every material on the modules
 *  of the student's enrolled courses, grouped by course. Visibility is
 *  module-level (materials have no cohort attachment layer). */
export function MaterialsPageContent() {
  const { data, isLoading } = useMyMaterials();
  const [filter, setFilter] = useState<Filter>("all");
  const [previewing, setPreviewing] = useState<Material | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const trackDownload = useTrackMaterialDownload();

  const rows = useMemo(() => data || [], [data]);

  const visible = useMemo(() => {
    switch (filter) {
      case "files":
        return rows.filter((r) => !!r.material.fileUrl);
      case "guides":
        return rows.filter(
          (r) => !r.material.fileUrl && !!r.material.description,
        );
      default:
        return rows;
    }
  }, [rows, filter]);

  const groups = useMemo(() => groupByCourse(visible), [visible]);

  const openPreview = (m: Material) => {
    if (!m.fileUrl) return;
    trackDownload.mutate(m.id);
    setPreviewing(m);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every course material and guide available to you, in one place.
        </p>
      </header>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        className="-mx-4 px-4"
      >
        <TabsList variant="line" className="w-fit overflow-x-auto">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <Card className="p-10 text-center">
          <Library className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">No materials</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "all"
              ? "Materials show up here once your tutor uploads them."
              : "Switch the filter to see other materials."}
          </p>
        </Card>
      )}

      {!isLoading &&
        groups.map((g) => (
          <section key={g.course.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: g.course.color || "var(--primary)" }}
              />
              <Link
                href={`/courses/${g.course.slug}`}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {g.course.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {g.items.length} item{g.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <Card className="p-0 overflow-hidden">
              <ul className="divide-y">
                {g.items.map((row) => {
                  const m = row.material;
                  const Icon = MATERIAL_ICON[m.type];
                  const hasFile = !!m.fileUrl;
                  const hasBody = !!m.description;
                  const instructionsOnly = !hasFile && hasBody;
                  const expanded = expandedId === m.id;
                  return (
                    <li key={m.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (instructionsOnly) {
                            setExpandedId(expanded ? null : m.id);
                          } else if (hasFile) {
                            openPreview(m);
                          }
                        }}
                        disabled={!hasFile && !instructionsOnly}
                        className="flex h-auto items-center gap-3 w-full justify-start px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                            {row.module.order != null
                              ? `Module ${row.module.order
                                  .toString()
                                  .padStart(2, "0")} · `
                              : ""}
                            {row.module.title}
                          </span>
                          <span className="block text-sm font-medium leading-tight">
                            {m.title}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {m.size || (instructionsOnly ? "Guide" : null)}
                          </span>
                        </span>
                        {hasFile ? (
                          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : instructionsOnly ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">
                            {expanded ? "Hide" : "Read"}
                          </span>
                        ) : null}
                      </Button>

                      {hasBody && (instructionsOnly ? expanded : true) && (
                        <div className="border-t border-border bg-muted/20 px-4 py-3">
                          <CollapsibleRichText
                            html={m.description}
                            maxHeight={instructionsOnly ? 9999 : 88}
                          />
                          {hasFile && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => openPreview(m)}
                              >
                                <Eye className="h-3 w-3" /> Preview
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground"
                                onClick={() => {
                                  void downloadFile(
                                    m.fileUrl,
                                    m.title,
                                    m.fileType,
                                  );
                                }}
                              >
                                <ExternalLink className="h-3 w-3" /> Download
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        ))}

      {previewing && previewing.fileUrl && (
        <MaterialPreviewDialog
          open={!!previewing}
          onOpenChange={(o) => !o && setPreviewing(null)}
          title={previewing.title}
          url={previewing.fileUrl}
          fileType={previewing.fileType}
        />
      )}
    </div>
  );
}

interface CourseGroup {
  course: MaterialWithContext["course"];
  items: MaterialWithContext[];
}

function groupByCourse(rows: MaterialWithContext[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>();
  for (const row of rows) {
    const existing = map.get(row.course.id);
    if (existing) existing.items.push(row);
    else map.set(row.course.id, { course: row.course, items: [row] });
  }
  return Array.from(map.values());
}
