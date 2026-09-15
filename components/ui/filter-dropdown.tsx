"use client";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  /** Small label above the trigger (e.g. "Status", "Mode"). */
  label: string;
  options: readonly FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** The "nothing applied" value — the trigger reads as active (solid
   *  border, tinted background, filled dot) for anything else. */
  defaultValue?: string;
  /** Render a skeleton trigger instead — for filters whose options
   *  come from a query (e.g. categories fetched from the API) rather
   *  than a hardcoded list. Never render a dropdown with an empty
   *  options array while real ones are still loading. */
  loading?: boolean;
  className?: string;
}

/**
 * The one filter-dropdown implementation every page uses. Built on
 * shadcn's `Select` (a value-picker) rather than `DropdownMenu` (an
 * action-menu) — a filter picks one value from a list, which is
 * exactly what `Select` is for, and it comes with real listbox
 * semantics (arrow-key nav, correct ARIA role) for free. Extracted
 * from what used to be a page-local `CourseFilterDropdown`; this is
 * the shape the CRM inspiration's "Sort by / Filter / Stage" toolbar
 * chips use, generalized so any page with a filter reaches for this
 * instead of re-implementing the trigger+content wiring.
 */
export function FilterDropdown({
  label,
  options,
  value,
  onValueChange,
  defaultValue = "all",
  loading = false,
  className,
}: FilterDropdownProps) {
  const isActive = value !== defaultValue;

  if (loading) {
    return (
      <div className={cn("min-w-40", className)}>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn("min-w-40", className)}>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <Select
        value={value}
        onValueChange={(next) => {
          // These filters are never clearable (every option, including
          // the "all" default, is a real item), so Base UI's `null`
          // case is unreachable — guard it anyway rather than assert.
          if (next !== null) onValueChange(next);
        }}
      >
        <SelectTrigger
          className={cn(
            "w-full font-medium transition-colors active:scale-[0.98]",
            isActive
              ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
              : "bg-background",
          )}
        >
          {isActive && (
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Lays out a row of `FilterDropdown`s consistently — wraps on mobile,
 *  a row on larger screens. Replaces every page's own copy of this
 *  flex wrapper. */
export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
