"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { IndexList } from "@/components/ui/index-list";
import { RichText } from "@/components/ui/rich-text";
import { cn, htmlToPlainText } from "@/lib/utils";
import type { TeachingModule } from "../types";

interface CohortModulesTabProps {
  modules: TeachingModule[];
}

export function CohortModulesTab({ modules }: CohortModulesTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
        No modules created for this syllabus yet.
      </div>
    );
  }

  return (
    <IndexList>
      {modules.map((m, idx) => {
        const expanded = expandedId === m.id;
        const taskCount = m.assignmentCount ?? 0;
        const videoCount = m.recordingCount ?? 0;
        const indexNum = m.order ?? idx + 1;

        return (
          <div key={m.id} className="border-b border-border">
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : m.id)}
              className="grid w-full grid-cols-[28px_minmax(0,1fr)_20px] items-center gap-4 py-4 text-left transition-colors hover:bg-muted/40 sm:grid-cols-[34px_minmax(0,1fr)_160px_20px]"
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {String(indexNum).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div className="truncate font-display text-sm font-semibold text-foreground">
                  {m.title}
                </div>
                {m.description && (
                  <div className="truncate text-xs text-muted-foreground">
                    {htmlToPlainText(m.description)}
                  </div>
                )}
              </div>

              <div className="hidden items-center gap-2 sm:flex text-[11px] text-muted-foreground font-mono">
                <span>{taskCount} {taskCount === 1 ? "task" : "tasks"}</span>
                <span>·</span>
                <span>{videoCount} {videoCount === 1 ? "video" : "videos"}</span>
              </div>

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </button>

            {expanded && m.description && (
              <div className="px-10 pb-4 pt-1 text-xs text-muted-foreground">
                <RichText html={m.description} className="leading-relaxed" />
              </div>
            )}
          </div>
        );
      })}
    </IndexList>
  );
}
