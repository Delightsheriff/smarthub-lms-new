"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/**
 * The mono-uppercase, pill-bordered toggle from the "Brief" dashboard
 * mockup's meta-bar (role/theme switch) — an ink-solid pressed state
 * inside a hairline pill, not a colored/filled segmented control. Kept
 * generic (not role-switcher-specific) so any binary/small toggle can
 * use the same chrome instead of a one-off implementation.
 *
 * Uses a shared-element `layoutId` for the sliding pill, so pass a
 * unique `layoutId` when more than one instance can be mounted at once
 * (otherwise Motion tries to animate between two unrelated instances).
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  layoutId = "segmented-control-pill",
  ariaLabel,
  className,
  hideLabelsBelowSm = false,
}: {
  items: readonly SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  ariaLabel: string;
  className?: string;
  /** Icon-only below `sm:` — for tight spots like a mobile top bar. */
  hideLabelsBelowSm?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border p-0.5",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors",
              active ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-foreground"
                transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.25, bounce: 0 }}
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />}
            <span className={hideLabelsBelowSm ? "hidden sm:inline" : undefined}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
