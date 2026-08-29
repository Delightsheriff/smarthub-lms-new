"use client";
import {
  BookOpen,
  ExternalLink,
  FileText,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { groupByCategory, useHelpLibrary } from "../api/help.queries";
import type { ApiHelpResource } from "../types/api.types";

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
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Help
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {groups.length > 0
            ? "Short guides for the things you do most."
            : "Nothing here yet — check back soon."}
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.name} className="space-y-3">
          <h2 className="font-semibold">{group.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResourceCard({ resource }: { resource: ApiHelpResource }) {
  const isVideo = resource.type === "video";

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {resource.type === "video" ? (
            <PlayCircle className="h-4 w-4" />
          ) : resource.type === "document" ? (
            <FileText className="h-4 w-4" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
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