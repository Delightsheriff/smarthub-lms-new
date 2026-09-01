"use client";

import React from "react";
import { History, GitCommit } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDateTime } from "@/lib/utils";
import type { Submission } from "../types";

interface SubmissionHistoryProps {
  submission: Submission;
}

export function SubmissionHistory({ submission }: SubmissionHistoryProps) {
  const history = submission.history || [];

  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4 text-primary" /> Submission History ({history.length})
      </div>

      <Accordion className="w-full space-y-2">
        {history.map((entry, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="rounded-xl border px-3 py-1 bg-muted/20"
          >
            <AccordionTrigger className="hover:no-underline py-2 text-xs font-medium">
              <div className="flex items-center justify-between w-full pr-3">
                <div className="flex items-center gap-2">
                  <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="capitalize">{entry.action}</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-3 text-xs text-muted-foreground space-y-1">
              {entry.notes ? (
                <p className="rounded-lg bg-background p-2 border font-mono text-[11px]">
                  {entry.notes}
                </p>
              ) : (
                <p>No notes attached to this history entry.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
