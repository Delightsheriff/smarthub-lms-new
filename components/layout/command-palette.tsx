"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { getNavItemsForMode, type NavItem } from "@/configs/nav";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The global ⌘K palette.
 *
 * Two parts, matching the legacy split:
 *  1. **Go to** — navigation shortcuts built locally from
 *     `getNavItemsForMode`, so switching student/instructor mode changes
 *     the shortcuts for free. Filtered live by the input.
 *  2. **Results** — server-backed, enrolment-scoped deep search. That
 *     group is deferred to Plan 009; this host is shaped so it slots in
 *     without touching the Go to group.
 *
 * Text resets whenever the palette closes so it reopens clean.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mode } = useEffectiveMode();
  const [input, setInput] = useState("");

  const navItems = getNavItemsForMode(mode, user);

  const navMatches = (() => {
    const q = input.trim().toLowerCase();
    const sorted = [...navItems].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );
    if (!q) return sorted;
    const tokens = q.split(/\s+/).filter(Boolean);
    return sorted.filter((item) =>
      tokens.every((t) => item.label.toLowerCase().includes(t))
    );
  })();

  const go = (item: NavItem) => {
    handleOpenChange(false);
    router.push(item.href);
  };

  // Clear the text when the palette closes (via dialog callback, not an
  // effect) so it reopens cleanly.
  const handleOpenChange = (next: boolean) => {
    if (!next) setInput("");
    onOpenChange(next);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Command palette"
      description="Search or jump to a page"
    >
      <Command>
        <CommandInput
          value={input}
          onValueChange={setInput}
          placeholder="Search your courses, tasks, recordings… or jump to a page"
        />
        <CommandList>
          {input.trim() && navMatches.length === 0 && (
            <CommandEmpty>No pages match &ldquo;{input.trim()}&rdquo;.</CommandEmpty>
          )}

          {navMatches.length > 0 && (
            <CommandGroup heading="Go to">
              {navMatches.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`nav:${item.label}:${item.href}`}
                    onSelect={() => go(item)}
                  >
                    <Icon />
                    <span className="flex-1 truncate">{item.label}</span>
                    <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/60" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
