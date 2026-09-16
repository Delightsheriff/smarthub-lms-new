"use client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccessStatus } from "../api/access.queries";
import { formatPrice } from "@/lib/utils";

const asDate = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

/**
 * Tells a learner their place on a course was taken away, and why.
 *
 * Revocation is per-course: the account still works and any other
 * course keeps running, so this sits alongside the remaining courses
 * rather than replacing the screen. Without it the revoked course
 * simply vanishes — every content endpoint filters on the active
 * enrolment — and a student can't tell a decision from a bug.
 *
 * The reason shown is the sentence the student was emailed, frozen at
 * revoke time. When there isn't one (an older unenrol, a manual fix)
 * the notice points at support rather than inventing an explanation.
 */
export function RevokedCourseNotice() {
  const { data } = useAccessStatus();
  const revoked = data?.revoked ?? [];
  if (!revoked.length) return null;

  return (
    <div className="space-y-3">
      {revoked.map((r) => {
        const on = asDate(r.revokedAt);
        const owes = (r.outstandingAmount ?? 0) > 0;
        return (
          <Card
            key={r.courseId}
            className="rounded-2xl border-destructive/30 bg-destructive/[0.04] p-4 shadow-sm sm:p-5"
          >
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold leading-tight text-foreground">
                  Your place on{" "}
                  <span className="text-destructive">{r.courseName}</span> was
                  withdrawn
                </p>

                {r.reasonText ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reason given: {r.reasonText}
                    {on ? ` · ${on}` : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {on ? `Withdrawn on ${on}. ` : ""}
                    Please contact support for details.
                  </p>
                )}

                {owes && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Outstanding balance:
                    </span>{" "}
                    <span className="font-medium tabular-nums text-warning">
                      {formatPrice(r.outstandingAmount!)}
                    </span>
                  </p>
                )}

                <p className="mt-2 text-sm text-muted-foreground">
                  The course content, assignments and recordings are no longer
                  available to you. Your account and any other course are
                  unaffected.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Settling up is the one action that can lead to a
                      restore, so it leads when money is owed. */}
                  {owes && (
                    <Button
                      size="sm"
                      render={<Link href="/billing" />}
                    >
                      View billing
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href="/help" />}
                  >
                    Contact support
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
