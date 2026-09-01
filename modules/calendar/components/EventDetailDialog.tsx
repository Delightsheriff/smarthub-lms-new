"use client";

import React from "react";
import {
  Clock,
  ExternalLink,
  MapPin,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import type { CalendarEventUI } from "../types";

interface EventDetailDialogProps {
  event: CalendarEventUI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  if (!event) return null;

  const getToneBadgeVariant = () => {
    switch (event.typeTone) {
      case "blue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "amber":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "violet":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      case "accent":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "primary":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={getToneBadgeVariant()}>{event.typeLabel}</Badge>
            {event.isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {event.title}
          </DialogTitle>
          {event.courseName && (
            <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{event.courseName}</span>
              {event.moduleTitle && <span>/ {event.moduleTitle}</span>}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Time & Date */}
          <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <div className="font-semibold text-foreground">
                {formatDateTime(event.start.toISOString())}
              </div>
              {event.end && (
                <div className="text-muted-foreground">
                  Ends: {formatDateTime(event.end.toISOString())}
                </div>
              )}
              {event.allDay && (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  All Day Event
                </Badge>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-1 rounded-xl border bg-background p-3">
              <div className="text-xs font-semibold text-foreground">Details</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Meeting / External Link */}
          {event.link && (
            <div className="pt-2 border-t">
              <Button
                render={
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="w-full rounded-xl"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open Meeting Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
