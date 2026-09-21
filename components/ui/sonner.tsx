"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Sonner, themed to match the app's editorial surfaces instead of its
 * stock rounded-md/shadow-sm look: same card shell (rounded-2xl, hairline
 * border) as Ledger/StatTile, plus a colored left rule per toast type —
 * the same "tone as a 3px accent bar" idiom NagItem uses for dashboard
 * nags, so a toast reads as one more member of the same design language
 * rather than a foreign browser-default popup.
 *
 * The base surface colors go through sonner's own `--normal-*` CSS vars
 * (the documented override point — className alone can lose to sonner's
 * inline styles); shape, the left rule, and icon tinting go through
 * `toastOptions.classNames`, keyed off the `data-type` sonner already
 * sets on each toast.
 */
export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      style={
        {
           "--normal-bg": "var(--glass-bg-regular)",
           "--normal-text": "var(--foreground)",
           "--normal-border": "var(--glass-border)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "glass-regular group toast !rounded-2xl !border-l-[3px] !border-l-muted-foreground/40 !pl-4 " +
            "data-[type=success]:!border-l-success data-[type=error]:!border-l-destructive " +
            "data-[type=warning]:!border-l-warning data-[type=info]:!border-l-accent",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground mt-0.5",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-lg !text-xs !font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          cancelButton:
            "!bg-muted !text-muted-foreground !rounded-lg !text-xs !font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          closeButton:
            "!bg-card !border-border !text-muted-foreground hover:!text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          icon:
            "group-data-[type=success]:text-success group-data-[type=error]:text-destructive " +
            "group-data-[type=warning]:text-warning group-data-[type=info]:text-accent",
        },
      }}
      {...props}
    />
  );
}
