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
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import { IndexList } from "@/components/ui/index-list";
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
  const { data, isLoading, isFetching, refetch } = useMyMaterials();
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

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const totalFiles = rows.filter((r) => !!r.material.fileUrl).length;
  const totalGuides = rows.filter(
    (r) => !r.material.fileUrl && !!r.material.description,
  ).length;
  const courseCount = groups.length;

  const openPreview = (m: Material) => {
    if (!m.fileUrl) return;
    trackDownload.mutate(m.id);
    setPreviewing(m);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={dateline}
        title="Course Materials"
        description={
          !isLoading ? (
            rows.length === 0 ? (
              "Course readings, handouts, and guides will appear here as modules unlock."
            ) : (
              <>
                <strong className="text-foreground">{rows.length}</strong> resources across{" "}
                <strong className="text-foreground">{courseCount}</strong> {courseCount === 1 ? "course" : "courses"}
                {totalFiles > 0 && (
                  <>
                    {" "}
                    · <strong className="text-foreground">{totalFiles}</strong> {totalFiles === 1 ? "file" : "files"}
                  </>
                )}
                {totalGuides > 0 && (
                  <>
                    {" "}
                    · <strong className="text-foreground">{totalGuides}</strong> {totalGuides === 1 ? "guide" : "guides"}
                  </>
                )}
              </>
            )
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <RefreshButton loading={isFetching} onClick={refetch} />
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.value} value={f.value} className="rounded-lg text-xs">
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon={Library}
          title="No materials"
          description={
            filter === "all"
              ? "Materials show up here once your tutor uploads them."
              : "Switch the filter to see other materials."
          }
        />
      )}

      {/* Course-grouped IndexList rows */}
      {!isLoading &&
        groups.map((g) => (
          <section key={g.course.id} className="space-y-1">
            {/* Course heading */}
            <div className="flex items-baseline justify-between pb-2 pt-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: g.course.color || "var(--primary)" }}
                />
                <Link
                  href={`/courses/${g.course.slug}`}
                  className="font-display text-base font-semibold text-foreground hover:text-accent transition-colors"
                >
                  {g.course.name}
                </Link>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {g.items.length} {g.items.length === 1 ? "resource" : "resources"}
              </span>
            </div>

            {/* IndexList — numbered hairline rows within this course */}
            <IndexList>
              {g.items.map((row, idx) => {
                const m = row.material;
                const Icon = MATERIAL_ICON[m.type];
                const hasFile = !!m.fileUrl;
                const hasBody = !!m.description;
                const instructionsOnly = !hasFile && hasBody;
                const expanded = expandedId === m.id;
                return (
                  <div key={m.id} className="border-b border-border transition-colors hover:bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                      <div
                        className="flex flex-1 items-start sm:items-center gap-3 min-w-0 cursor-pointer"
                        onClick={() => {
                          if (instructionsOnly) {
                            setExpandedId(expanded ? null : m.id);
                          } else if (hasFile) {
                            openPreview(m);
                          }
                        }}
                      >
                        {/* Number */}
                        <span className="font-mono text-xs tabular-nums text-muted-foreground w-6 shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground truncate">
                            {row.module.order != null
                              ? `Module ${row.module.order
                                  .toString()
                                  .padStart(2, "0")} · `
                              : ""}
                            {row.module.title}
                          </span>
                          <span className="block text-sm font-medium leading-snug text-foreground">
                            {m.title}
                          </span>
                          <span className="block font-mono text-xs text-muted-foreground mt-0.5">
                            {m.size || (instructionsOnly ? "Reading guide" : null)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-9 sm:pl-0">
                        {hasFile ? (
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => openPreview(m)}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg px-2.5 text-xs"
                              onClick={() => {
                                void downloadFile(
                                  m.fileUrl,
                                  m.title,
                                  m.fileType,
                                );
                              }}
                            >
                              <ExternalLink className="mr-1 h-3.5 w-3.5" /> Download
                            </Button>
                          </div>
                        ) : instructionsOnly ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg px-3 text-xs font-medium"
                            onClick={() => setExpandedId(expanded ? null : m.id)}
                          >
                            {expanded ? "Hide guide" : "Read guide"}
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {hasBody && (instructionsOnly ? expanded : false) && (
                      <div className="border-t border-border bg-muted/20 px-4 py-3.5 sm:px-6">
                        <CollapsibleRichText
                          html={m.description}
                          maxHeight={instructionsOnly ? 9999 : 88}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </IndexList>
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
