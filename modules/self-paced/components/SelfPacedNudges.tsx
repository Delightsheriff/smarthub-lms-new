"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ledger, NagItem } from "@/components/ui/ledger";
import {
  useDismissNudge,
  useSelfPacedCourses,
  useSelfPacedNudges,
} from "../api/self-paced.queries";

/**
 * Active reminders to keep going ("Start X", "Pick up Y where you left
 * off"), as nag rows in one ledger rather than a card each. The API's
 * links arrive already translated to `/learn` routes (see
 * `lib/nudge-link.ts`). Dismissing hides a reminder for good.
 * Self-gating: nothing renders without one.
 */
export function SelfPacedNudges({ courseId }: { courseId?: string }) {
  const { data: courses } = useSelfPacedCourses();
  const { data } = useSelfPacedNudges({ enabled: (courses?.length ?? 0) > 0 });
  const dismiss = useDismissNudge();

  const nudges = (data ?? []).filter(
    (n) => !courseId || n.course?.id === courseId
  );
  if (!nudges.length) return null;

  return (
    <Ledger title="Reminders" count={nudges.length > 1 ? nudges.length : undefined}>
      {nudges.slice(0, 3).map((n) => (
        <NagItem
          key={n.id}
          tone="accent"
          title={n.title}
          meta={n.message || n.course?.name}
          actions={
            <div className="flex shrink-0 items-center gap-1">
              {n.href && (
                <Link
                  href={n.href}
                  className="font-mono text-[11px] font-medium text-primary hover:underline"
                >
                  Continue →
                </Link>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground"
                aria-label={`Dismiss reminder: ${n.title}`}
                disabled={dismiss.isPending && dismiss.variables === n.id}
                onClick={() => dismiss.mutate(n.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          }
        />
      ))}
    </Ledger>
  );
}
