"use client";
import { BookOpen, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { cn } from "@/lib/utils";

/**
 * Student / Teaching workspace switcher. Only renders for users whose
 * `lmsRole === 'both'`; everyone else's mode is pinned by their role
 * and the rail just doesn't show the switcher.
 *
 * Two variants:
 *   - `expanded`  a workspace-style dropdown (current mode + chevron)
 *                 that opens a menu to pick — used in the expanded side
 *                 rail, the top bar (mobile) and the mobile menu.
 *   - `collapsed` two stacked icon buttons — used in the collapsed rail
 *                 where there's no room for text.
 *
 * Switching sends the user to the dashboard: the two modes surface
 * disjoint navigation paths, so preserving a subpath like `/teach/cohorts`
 * after switching to student mode would 404 anyway.
 */
interface Props {
  variant?: "expanded" | "collapsed";
  className?: string;
}

const ITEMS = [
  { value: "student", label: "Student", icon: BookOpen },
  { value: "instructor", label: "Teaching", icon: GraduationCap },
] as const;

export function RoleSwitcher({ variant = "expanded", className }: Props) {
  const { mode, canSwitch, setMode } = useEffectiveMode();
  const router = useRouter();

  if (!canSwitch) return null;

  const switchTo = (value: "student" | "instructor") => {
    setMode(value);
    router.push("/dashboard");
  };

  if (variant === "collapsed") {
    return (
      <div
        className={cn("flex flex-col items-center gap-1", className)}
        role="tablist"
        aria-label="Switch mode"
      >
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = mode === it.value;
          return (
            <Button
              key={it.value}
              type="button"
              variant={active ? "default" : "ghost"}
              size="icon-sm"
              role="tab"
              aria-selected={active}
              onClick={() => switchTo(it.value)}
              title={it.label}
              className={cn("h-8 w-8 rounded-lg", !active && "text-muted-foreground")}
            >
              <Icon className="h-4 w-4 stroke-[1.75]" />
            </Button>
          );
        })}
      </div>
    );
  }

  return <SlidingSwitch mode={mode} onSwitch={switchTo} className={className} />;
}

/** A sliding solid-fill segmented control, not a dropdown — the switch
 *  is binary and used constantly, so it should read (and animate) as
 *  one continuous state change rather than a menu to open. The pill
 *  uses `layoutId` for a shared-element slide (Motion's FLIP-style
 *  animation) instead of hand-computed transform math. */
function SlidingSwitch({
  mode,
  onSwitch,
  className,
}: {
  mode: "student" | "instructor";
  onSwitch: (value: "student" | "instructor") => void;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Switch workspace"
      className={cn(
        "relative flex w-full items-center gap-0.5 rounded-lg bg-muted p-0.5",
        className
      )}
    >
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const active = mode === it.value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSwitch(it.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors active:scale-[0.97]",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="role-switch-pill"
                className="absolute inset-0 -z-10 rounded-md bg-primary shadow-xs"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.25, bounce: 0 }
                }
              />
            )}
            <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
            <span className="hidden truncate sm:inline">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
