"use client";
import { BookOpen, Check, ChevronsUpDown, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
 * different nav + content, so landing on a shared home avoids leaving
 * them on a page that only made sense in the mode they just left.
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
    if (value === mode) return;
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
            <button
              key={it.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTo(it.value)}
              title={it.label}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  }

  const current = ITEMS.find((it) => it.value === mode) ?? ITEMS[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Switch workspace"
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              className
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <CurrentIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{current.label}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-40">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = mode === it.value;
          return (
            <DropdownMenuItem key={it.value} onClick={() => switchTo(it.value)}>
              <Icon className="text-muted-foreground" />
              <span className="flex-1">{it.label}</span>
              {active && <Check className="text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
