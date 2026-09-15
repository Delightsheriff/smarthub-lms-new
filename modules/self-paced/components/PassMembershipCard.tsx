"use client";
import { useSyncExternalStore } from "react";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useMyPass } from "../api/self-paced.queries";

const EXCLUDED_COPY: Record<string, string> = {
  "live-instruction": "Live classes",
  mentorship: "Mentorship",
  "project-review": "Project reviews",
  "career-support": "Career support",
  "internship-pathway": "Internship pathway",
};

const DAY = 24 * 60 * 60 * 1000;
const emptySubscribe = () => () => {};

/**
 * All-access pass membership: when it ends, a renewal already queued,
 * and what a pass does not include. Renders nothing unless the pass is
 * live — including while the product is switched off.
 */
export function PassMembershipCard({ compact = false }: { compact?: boolean }) {
  const { data: pass } = useMyPass();
  const now = useSyncExternalStore(
    emptySubscribe,
    () => Date.now(),
    () => 0
  );

  if (!pass?.active) return null;

  const expires = pass.expiresAt ? new Date(pass.expiresAt).getTime() : NaN;
  const daysLeft = Number.isFinite(expires) && now > 0
    ? Math.max(0, Math.ceil((expires - now) / DAY))
    : undefined;
  const endingSoon = daysLeft !== undefined && daysLeft <= 14 && !pass.renewalEndsAt;

  return (
    <Card className="p-5">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Ticket className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold leading-tight">All-access pass</p>
            {endingSoon ? (
              <Badge
                variant="outline"
                className="border-warning/30 text-warning bg-warning/10"
              >
                Ends in {daysLeft} {daysLeft === 1 ? "day" : "days"}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-success/30 text-success bg-success/10"
              >
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Every self-paced course is open to you
            {pass.expiresAt && <> until <strong>{formatDate(pass.expiresAt, "long")}</strong></>}.
          </p>
          {pass.renewalEndsAt && (
            <p className="text-sm text-muted-foreground">
              Your renewal starts when this term ends and runs until{" "}
              <strong>{formatDate(pass.renewalEndsAt, "long")}</strong>.
            </p>
          )}
          {!compact && pass.excludes.length > 0 && (
            <p className="text-xs text-muted-foreground pt-1">
              Not included:{" "}
              {pass.excludes.map((e) => EXCLUDED_COPY[e] ?? e.replace(/-/g, " ")).join(", ")}
              . These come with a cohort programme.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
