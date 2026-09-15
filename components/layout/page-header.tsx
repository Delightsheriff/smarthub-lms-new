import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one page-header shape every route content component uses —
 * title, optional description, optional right-aligned actions
 * (a filter bar, a primary button, a tab strip). Every page used to
 * hand-roll `<h1 className="text-2xl font-bold tracking-tight">` plus
 * its own responsive wrapper; this replaces all of them so a heading
 * style change is one file, not a grep-and-replace across the app.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
