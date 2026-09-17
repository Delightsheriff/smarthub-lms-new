"use client";
import Link from "next/link";
import { useInternshipWorkspace } from "../api/internships.queries";

/**
 * Internship-progress row in the dashboard's "Needs a look" ledger.
 * Self-gating: hidden when the student has no placement (grads /
 * non-interns never see it). Keeps its own progress rule (unlike the
 * plain one-line nags) since "how far along" is the actual content
 * here, not a secondary detail.
 */
export function InternshipDashboardCard() {
  const { data, isLoading } = useInternshipWorkspace();

  if (isLoading) return null;
  if (!data) return null;

  return (
    <Link
      href="/internships"
      className="-mx-1 flex flex-col gap-2 rounded-lg border-t border-border px-1 py-[11px] first:border-t-0 hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <span className="h-8 w-[3px] shrink-0 self-stretch rounded-full bg-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-foreground">
            {data.internship.product.name}
          </div>
          <div className="truncate text-[11.5px] text-muted-foreground">Internship</div>
        </div>
        <span className="shrink-0 font-mono text-[11px] font-medium text-primary">
          Workspace →
        </span>
      </div>
      <div className="flex items-center gap-2 pl-[15px]">
        <div className="relative h-0.5 flex-1 rounded-full bg-border">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, data.progressPercent))}%` }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {data.progressPercent}%
        </span>
      </div>
    </Link>
  );
}