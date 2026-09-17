import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A hairline-divided list of dated/typed entries — "Today & upcoming",
 * "Needs grading" — replacing the boxed-card-per-item pattern for
 * anything that's really a short list, not a grid of equal objects.
 * Rows share one card shell; dividers between them do the separating
 * work a border-per-item would otherwise duplicate.
 */
export function Ledger({
  title,
  count,
  children,
  className,
  empty,
}: {
  title: string;
  count?: number;
  children?: ReactNode;
  className?: string;
  /** Shown instead of `children` when there's nothing to list. */
  empty?: ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div
      className={cn(
        "flex flex-col rounded-[20px] border border-border bg-card px-5 pb-1 pt-[18px]",
        className,
      )}
    >
      <h3 className="mb-3 flex items-center justify-between font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {title}
        {typeof count === "number" && (
          <span className="text-accent">{count}</span>
        )}
      </h3>
      {hasItems ? (
        children
      ) : (
        <div className="py-6 text-center text-xs text-muted-foreground">
          {empty ?? "Nothing here right now."}
        </div>
      )}
    </div>
  );
}

const DOT_TONE = {
  due: "bg-warning",
  live: "bg-success",
  info: "bg-muted-foreground",
} as const;

export function LedgerItem({
  tone = "info",
  title,
  meta,
  when,
  href,
  onClick,
}: {
  tone?: keyof typeof DOT_TONE;
  title: ReactNode;
  meta?: ReactNode;
  when?: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const interactive = Boolean(href || onClick);
  const Comp = href ? "a" : onClick ? "button" : "div";
  return (
    <Comp
      href={href}
      onClick={onClick}
      type={onClick && !href ? "button" : undefined}
      className={cn(
        "flex w-full items-baseline gap-2.5 border-t border-border py-[11px] text-left first:border-t-0",
        interactive && "-mx-1 rounded-lg px-1 transition-colors hover:bg-muted/50",
      )}
    >
      <span
        className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", DOT_TONE[tone])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-snug text-foreground">
          {title}
        </div>
        {meta && (
          <div className="truncate text-[11.5px] text-muted-foreground">
            {meta}
          </div>
        )}
      </div>
      {when && (
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
          {when}
        </span>
      )}
    </Comp>
  );
}

const RULE_TONE = {
  due: "bg-warning",
  accent: "bg-primary",
  info: "bg-muted-foreground/40",
} as const;

/**
 * One row in a "needs a look" list — a self-gating status/opportunity
 * nudge (outstanding balance, a ready payout, a document to collect)
 * that used to be its own full bordered `Card`. A colored left rule
 * carries the same urgency signal a card's tinted border/background
 * did, without every nudge competing for the same visual weight as a
 * real content card (the "continue learning" hero, a course).
 */
export function NagItem({
  tone = "info",
  title,
  meta,
  cta,
  href,
  onClick,
  actions,
}: {
  tone?: keyof typeof RULE_TONE;
  title: ReactNode;
  meta?: ReactNode;
  /** Single-link/button case: label for the trailing action. */
  cta?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Escape hatch for a row needing more than one action (e.g. View
   *  + Download) — supply the whole trailing slot yourself instead
   *  of `cta`/`href`/`onClick`. */
  actions?: ReactNode;
}) {
  const Cta = href ? "a" : "button";
  return (
    <div className="flex items-center gap-3 border-t border-border py-[11px] first:border-t-0">
      <span
        className={cn("h-8 w-[3px] shrink-0 self-stretch rounded-full", RULE_TONE[tone])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground">{title}</div>
        {meta && <div className="truncate text-[11.5px] text-muted-foreground">{meta}</div>}
      </div>
      {actions ?? (
        <Cta
          href={href}
          onClick={onClick}
          className="shrink-0 font-mono text-[11px] font-medium text-primary hover:underline"
        >
          {cta}
        </Cta>
      )}
    </div>
  );
}
