"use client";
import Link from "next/link";
import { ArrowRight, BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDismissNudge,
  useSelfPacedCourses,
  useSelfPacedNudges,
} from "../api/self-paced.queries";

/**
 * Active reminders to keep going ("Start X", "Pick up Y where you left off").
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
    <section className="space-y-2" aria-label="Reminders">
      {nudges.slice(0, 3).map((n) => (
        <Card
          key={n.id}
          className="flex items-start gap-3 p-4 border-primary/20 bg-primary/[0.03]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BellRing className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{n.title}</p>
            {n.message && (
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
            )}
            {n.href && (
              <Button
                size="sm"
                className="mt-2.5"
                render={
                  <Link href={n.href}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            aria-label="Dismiss reminder"
            disabled={dismiss.isPending && dismiss.variables === n.id}
            onClick={() => dismiss.mutate(n.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </section>
  );
}
