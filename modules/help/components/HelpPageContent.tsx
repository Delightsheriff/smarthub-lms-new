"use client";
import { CircleHelp, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { groupByCategory, useHelpLibrary } from "../api/help.queries";
import type { ApiHelpResource } from "../types/api.types";

/**
 * Help — a library of how-to resources, split into:
 * 1. Video Walkthroughs — visual player grid with posters.
 * 2. Documentation & Links — magazine IndexList with numbered rows.
 */
export function HelpPageContent() {
  const { mode } = useEffectiveMode();
  const { data, isLoading } = useHelpLibrary(mode);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  const groups = groupByCategory(data ?? []);
  const totalGuides = (data ?? []).length;

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Knowledge Base & Support`}
        title="Help & Guides"
        description={
          totalGuides > 0 ? (
            <>
              Short walkthroughs and documentation for the things you do most.{" "}
              <strong className="text-foreground">{totalGuides}</strong> guide{totalGuides === 1 ? "" : "s"} across{" "}
              <strong className="text-foreground">{groups.length}</strong> {groups.length === 1 ? "category" : "categories"}.
            </>
          ) : (
            "Short guides and walkthroughs for the things you do most."
          )
        }
      />

      {groups.length === 0 && (
        <EmptyState
          icon={CircleHelp}
          title="Nothing here yet"
          description="Check back soon — new guides land here as they're written."
        />
      )}

      {groups.map((group) => {
        const videos = group.resources.filter((r) => r.type === "video");
        const docsAndLinks = group.resources.filter((r) => r.type !== "video");

        return (
          <section key={group.name} className="space-y-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              {group.name}
            </h2>

            {/* Video section — only rendered if videos exist in this category */}
            {videos.length > 0 && (
              <div className="space-y-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
                  Video Walkthroughs
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {videos.map((v) => (
                    <VideoCard key={v._id} resource={v} />
                  ))}
                </div>
              </div>
            )}

            {/* Documents & links section — magazine IndexList */}
            {docsAndLinks.length > 0 && (
              <div className="space-y-2">
                {videos.length > 0 && (
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground pt-2">
                    Articles & Documentation
                  </p>
                )}
                <IndexList>
                  {docsAndLinks.map((doc, idx) => (
                    <IndexRow
                      key={doc._id}
                      index={idx + 1}
                      title={doc.title}
                      subtitle={doc.description}
                      status={doc.type === "document" ? "Guide" : "Link"}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    />
                  ))}
                </IndexList>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function VideoCard({ resource }: { resource: ApiHelpResource }) {
  return (
    <Card className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all duration-300">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
          <PlayCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold leading-tight text-foreground">
            {resource.title}
          </p>
          {resource.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      <video
        src={resource.url}
        poster={resource.thumbnailUrl}
        controls
        playsInline
        preload="none"
        className="aspect-video w-full rounded-xl bg-muted/60"
      />
    </Card>
  );
}
