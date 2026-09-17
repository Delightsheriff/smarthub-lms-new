"use client";
import { BookOpen, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
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

/** The mono/pill "seg" toggle (see SegmentedControl) instead of a
 *  dropdown — the switch is binary and used constantly, so it should
 *  read (and animate) as one continuous state change rather than a
 *  menu to open. */
function SlidingSwitch({
  mode,
  onSwitch,
  className,
}: {
  mode: "student" | "instructor";
  onSwitch: (value: "student" | "instructor") => void;
  className?: string;
}) {
  return (
    <SegmentedControl
      items={ITEMS}
      value={mode}
      onChange={onSwitch}
      layoutId="role-switch-pill"
      ariaLabel="Switch workspace"
      className={cn("w-full justify-center", className)}
      hideLabelsBelowSm
    />
  );
}
