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
        <Card key={m.id} className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm hover:border-primary/40 transition-all">
          <CardContent className="p-0 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  Module {m.order ?? idx + 1}
                </Badge>
                <h4 className="font-display font-semibold text-sm text-foreground">{m.title}</h4>
              </div>
              {m.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 text-xs">
              <Badge variant="secondary" className="text-[10px]">
                <Award className="mr-1 h-3 w-3 text-accent" /> {m.assignmentCount ?? 0} Tasks
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                <Video className="mr-1 h-3 w-3 text-primary" /> {m.recordingCount ?? 0} Videos
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
