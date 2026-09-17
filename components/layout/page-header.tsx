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
  eyebrow,
  dateline,
  divider = false,
  variant = "default",
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Small uppercase label above the title. Editorial variant only. */
  eyebrow?: string;
  /**
   * Masthead-style dateline above the title — e.g. "Tuesday, Sep 17 ·
   * Data Science Cohort". Renders in mono, replaces `eyebrow`'s rule
   * treatment when both are given (a page shows one or the other, not
   * both). Editorial variant only.
   */
  dateline?: string;
  /** Draws a hairline rule under the whole header block — the masthead
   *  effect for a page that opens a distinct content section below it
   *  (the dashboard). Off by default so existing editorial headers,
   *  which sit directly above their own content, are unaffected. */
  divider?: boolean;
  /**
   * "editorial" swaps the plain sans title for the serif display
   * treatment (see plans/015-editorial-design-sync.md) — reserved for
   * narrative surfaces (course pages, dashboard hero). Dense operator
   * surfaces (tables, forms, settings) stay on "default".
   */
  variant?: "default" | "editorial";
}) {
  if (variant === "editorial") {
    return (
      <div
        className={cn(
          "flex flex-col gap-6 font-sans sm:flex-row sm:items-end sm:justify-between",
          divider && "border-b border-border pb-7",
          className,
        )}
      >
        <div className="max-w-2xl space-y-3">
          {dateline ? (
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
              {dateline}
            </p>
          ) : eyebrow ? (
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-3xl leading-[1.05] text-balance text-foreground md:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex min-w-0 shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    );
  }

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
        <div className="flex min-w-0 shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
