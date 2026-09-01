"use client";

import React from "react";
import { Award, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeachingModule } from "../types";

interface CohortModulesTabProps {
  modules: TeachingModule[];
}

export function CohortModulesTab({ modules }: CohortModulesTabProps) {
  return (
    <div className="space-y-3">
      {modules.map((m, idx) => (
        <Card key={m.id} className="rounded-2xl border bg-card p-4 space-y-2 shadow-xs">
          <CardContent className="p-0 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  Module {m.order ?? idx + 1}
                </Badge>
                <h4 className="font-bold text-sm text-foreground">{m.title}</h4>
              </div>
              {m.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 text-xs">
              <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950/50">
                <Award className="mr-1 h-3 w-3" /> {m.assignmentCount ?? 0} Tasks
              </Badge>
              <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/50">
                <Video className="mr-1 h-3 w-3" /> {m.recordingCount ?? 0} Videos
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
