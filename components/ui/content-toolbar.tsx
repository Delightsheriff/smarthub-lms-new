"use client";

import { ArrowDownUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RecordingKind, SortDirection } from "@/modules/learning/utils/content-filter";

const KIND_LABEL: Record<RecordingKind | "all", string> = {
  all: "All classes",
  live: "Live classes",
  recorded: "Pre-recorded",
};

/**
 * Search / kind / order bar above a content list (recordings, materials,
 * assignments). The kind filter shows only where the live vs
 * pre-recorded split exists. The "x of y" count speaks up only when a
 * filter is hiding something.
 */
export function ContentToolbar({
  query,
  onQuery,
  kind,
  onKind,
  direction,
  onDirection,
  placeholder = "Search…",
  label = "Search",
  showing,
  total,
}: {
  query: string;
  onQuery: (value: string) => void;
  kind?: RecordingKind | "all";
  onKind?: (value: RecordingKind | "all") => void;
  direction: SortDirection;
  onDirection: (value: SortDirection) => void;
  placeholder?: string;
  /** Accessible name for the search input. */
  label?: string;
  showing: number;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      <div className="relative min-w-0 flex-1 basis-40 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-8 pl-8"
        />
      </div>

      {kind && onKind && (
        <Select value={kind} onValueChange={(v) => v && onKind(v as RecordingKind | "all")}>
          <SelectTrigger size="sm" aria-label="Class type" className="w-[140px] text-xs">
            <SelectValue>{(v: string | null) => KIND_LABEL[(v ?? "all") as RecordingKind | "all"]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(KIND_LABEL) as (RecordingKind | "all")[]).map((k) => (
              <SelectItem key={k} value={k} className="text-xs">
                {KIND_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => onDirection(direction === "default" ? "reversed" : "default")}
        aria-label={
          direction === "default"
            ? "Newest first. Switch to oldest first"
            : "Oldest first. Switch to newest first"
        }
      >
        <ArrowDownUp className="h-3.5 w-3.5" aria-hidden />
        {direction === "default" ? "Newest" : "Oldest"}
      </Button>

      {showing !== total && (
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {showing} of {total}
        </span>
      )}
    </div>
  );
}
