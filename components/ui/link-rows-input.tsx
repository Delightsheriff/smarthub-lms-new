"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContentLink } from "@/types/content-link";

/** Server cap on a link name (helpers/content-links.helper.ts). */
export const LINK_NAME_MAX = 80;

interface LinkRowsInputProps {
  value: ContentLink[];
  onChange: (rows: ContentLink[]) => void;
  hint?: string;
  urlPlaceholder?: string;
  addLabel?: string;
  disabled?: boolean;
}

/**
 * Repeatable name + url rows for authoring forms.
 *
 * The name is optional — the server fills in "Link 1", "Link 2" by
 * position, and the placeholder shows exactly what that will be, so
 * leaving it blank is a visible choice rather than a gap.
 */
export function LinkRowsInput({
  value,
  onChange,
  hint,
  urlPlaceholder = "https://…",
  addLabel = "Add link",
  disabled,
}: LinkRowsInputProps) {
  const setRow = (index: number, patch: Partial<ContentLink>) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div>
      {hint && (
        <p className="text-xs text-muted-foreground mb-2">{hint}</p>
      )}
      <div className="space-y-2">
        {value.map((row, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="w-32 shrink-0 sm:w-40">
              <Input
                value={row.name}
                onChange={(e) => setRow(i, { name: e.target.value })}
                placeholder={`Link ${i + 1}`}
                maxLength={LINK_NAME_MAX}
                disabled={disabled}
                aria-label={`Name for link ${i + 1}`}
                className="rounded-xl text-xs h-9"
              />
              {row.name.length > LINK_NAME_MAX - 20 && (
                <p className="mt-1 text-right text-[11px] font-mono text-muted-foreground">
                  {row.name.length}/{LINK_NAME_MAX}
                </p>
              )}
            </div>
            <Input
              type="url"
              value={row.url}
              onChange={(e) => setRow(i, { url: e.target.value })}
              placeholder={urlPlaceholder}
              disabled={disabled}
              className="flex-1 rounded-xl text-xs h-9"
              aria-label={`URL for link ${i + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => onChange(value.filter((_, x) => x !== i))}
              aria-label={`Remove link ${i + 1}`}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 rounded-xl text-xs h-8"
        disabled={disabled}
        onClick={() => onChange([...value, { name: "", url: "" }])}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

/** Drop blank rows before submitting. */
export const cleanLinkRows = (rows: ContentLink[]): ContentLink[] =>
  rows
    .map((r) => ({ name: r.name.trim(), url: r.url.trim() }))
    .filter((r) => r.name || r.url);
