"use client";
import {
  BookOpen,
  CircleHelp,
  ExternalLink,
  FileText,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { groupByCategory, useHelpLibrary } from "../api/help.queries";
import type { ApiHelpResource } from "../types/api.types";

/** One look per resource type — a category is metadata worth a real
 *  color, not a bare glyph in a one-size-fits-all tint. Video keeps
 *  the brand accent (the highest-energy surface, matches watching
 *  something); document and link stay on primary/neutral. */
const RESOURCE_STYLE: Record<
  ApiHelpResource["type"],
  { icon: typeof PlayCircle; className: string }
> = {
  video: { icon: PlayCircle, className: "bg-accent text-white" },
  document: { icon: FileText, className: "bg-primary text-primary-foreground" },
  link: { icon: ExternalLink, className: "bg-muted text-foreground" },
};

/** Help — a small library of how-to resources, filtered by the user's
 *  effective mode so students and instructors each see relevant help.
 *  Videos play natively (not embedded iframes). */
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help"
        description={
          groups.length > 0
            ? "Short guides for the things you do most."
            : undefined
        }
      />

      {groups.length === 0 && (
        <EmptyState
          icon={CircleHelp}
          title="Nothing here yet"
          description="Check back soon — new guides land here as they're written."
        />
      )}

      {groups.map((group) => (
        <section key={group.name} className="space-y-3">
          <h2 className="font-semibold">{group.name}</h2>
          <Stagger className="grid gap-3 sm:grid-cols-2">
            {group.resources.map((r) => (
              <StaggerItem key={r._id}>
                <ResourceCard resource={r} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ))}
    </div>
  );
}

function ResourceCard({ resource }: { resource: ApiHelpResource }) {
  const isVideo = resource.type === "video";
  const style = RESOURCE_STYLE[resource.type];
  const Icon = style.icon;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.className}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {resource.title}
          </p>
          {resource.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      {isVideo ? (
        <video
          src={resource.url}
          poster={resource.thumbnailUrl}
          controls
          playsInline
          preload="none"
          className="aspect-video w-full rounded-md bg-muted"
        />
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mt-auto"
          render={
            <a href={resource.url} target="_blank" rel="noreferrer noopener" />
          }
        >
          {resource.type === "document" ? (
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          )}
          {resource.type === "document" ? "Read the guide" : "Open resource"}
        </Button>
      )}

      <Badge variant="secondary" className="w-fit">
        {resource.type}
      </Badge>
    </Card>
  );
}
