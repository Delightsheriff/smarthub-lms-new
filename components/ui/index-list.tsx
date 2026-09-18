import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * A magazine-index list — numbered rows separated by hairlines, not a
 * grid of boxed cards. Replaces "browse everything you have" surfaces
 * (course list, cohort list) that don't need a card's own border/shadow
 * per item; the row's content (title, progress, status) already carries
 * the necessary separation.
 *
 * Progress and status columns hide below 720px — a numbered title row
 * plus a chevron carries the essential "what is this, can I open it"
 * job at phone width; the rest is available on the detail page.
 */
export function IndexList({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-border">
      {children}
    </div>
  );
}

export function IndexRow({
  index,
  title,
  subtitle,
  progress,
  status,
  href,
  onClick,
  actions,
  target,
  rel,
}: {
  index: number;
  title: ReactNode;
  subtitle?: ReactNode;
  /** 0–100. Omit for a row with no progress concept (e.g. a cohort that hasn't started). */
  progress?: number;
  status?: ReactNode;
  href?: string;
  onClick?: () => void;
  actions?: ReactNode;
  target?: string;
  rel?: string;
}) {
  const content = (
    <>
      {/* Visual editorial index (padded "01") is hidden from screen readers to prevent
          awkward "zero one" announcements. A semantic sr-only label conveys the clean index number. */}
      <span
        aria-hidden="true"
        className="font-mono text-xs tabular-nums text-muted-foreground select-none"
      >
        {String(index).padStart(2, "0")}
      </span>
      <span className="sr-only">{index}. </span>

      <div className="min-w-0">
        <div className="truncate font-display text-base font-semibold text-foreground">
          {title}
        </div>
        {subtitle && (
          <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative h-0.5 flex-1 rounded-full bg-border">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
      )}
      {typeof progress !== "number" && <span className="hidden sm:block" />}

      {status && (
        <span className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-muted-foreground sm:block">
          {status}
        </span>
      )}
      {!status && <span className="hidden sm:block" />}

      {actions ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </>
  );

  const className =
    "group/index-row grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 text-left transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-muted/40 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:grid-cols-[34px_minmax(0,1fr)_140px_90px_auto]";

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
