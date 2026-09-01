"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEventUI } from "../types";

interface CourseFilterChipsProps {
  events: CalendarEventUI[];
  hiddenScopes: Set<string>;
  onToggleScope: (scopeId: string) => void;
}

export function CourseFilterChips({
  events,
  hiddenScopes,
  onToggleScope,
}: CourseFilterChipsProps) {
  // Extract unique scope/course groups from events
  const groupsMap = new Map<string, { label: string; count: number }>();

  for (const e of events) {
    const scopeKey = e.scopeId || e.scope || "global";
    const label = e.courseName || (e.scope === "global" ? "General / Global" : "Course Schedule");

    const existing = groupsMap.get(scopeKey);
    if (existing) {
      existing.count += 1;
    } else {
      groupsMap.set(scopeKey, { label, count: 1 });
    }
  }

  const groups = Array.from(groupsMap.entries());

  if (groups.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
        <Filter className="h-3.5 w-3.5" />
        <span>Filter:</span>
      </div>
      {groups.map(([scopeKey, { label, count }]) => {
        const isHidden = hiddenScopes.has(scopeKey);
        return (
          <Badge
            key={scopeKey}
            variant={isHidden ? "outline" : "secondary"}
            onClick={() => onToggleScope(scopeKey)}
            className={cn(
              "cursor-pointer text-xs transition-colors rounded-xl px-2.5 py-1 select-none",
              isHidden
                ? "text-muted-foreground opacity-60 hover:opacity-100"
                : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
            )}
          >
            {label} ({count})
          </Badge>
        );
      })}
    </div>
  );
}
