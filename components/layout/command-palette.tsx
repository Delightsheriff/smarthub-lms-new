"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSearch } from "@/modules/search/api/search.queries";
import { iconForHint } from "@/modules/search/api/normalise";
import type { SearchResult } from "@/modules/search/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The global ⌘K palette.
 *
 * Two parts:
 *  1. **Go to** — navigation shortcuts built locally from
 *     `getNavItemsForMode`, so switching student/instructor mode changes
 *     the shortcuts for free. Filtered live by the input.
 *  2. **Results** — server-backed, enrolment-scoped deep search (courses,
 *     modules, tasks, recordings, materials, webinars).
 *
 * Text resets whenever the palette closes so it reopens clean.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mode } = useEffectiveMode();
  const [input, setInput] = React.useState("");
  const query = useDebouncedValue(input, 200);

  // Wrap onOpenChange so closing also clears the local text — no effect
  // needed, the callback fires synchronously before React re-renders.
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        setInput("");
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const { data: groups, isFetching } = useSearch(query);

  const navItems = React.useMemo(
    () => getNavItemsForMode(mode, user),
    [mode, user]
  );

  // Local "Go to" matches. With text, filter nav labels by every token;
  // with no text, surface the full list as a shortcut launcher.
  const navMatches = React.useMemo<NavItem[]>(() => {
    const q = input.trim().toLowerCase();
    const sorted = [...navItems].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );
    if (!q) return sorted;
    const tokens = q.split(/\s+/).filter(Boolean);
    return sorted.filter((item) =>
      tokens.every((t) => item.label.toLowerCase().includes(t))
    );
  }, [input, navItems]);

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const hasQuery = input.trim().length >= 2;
  const resultGroups = groups ?? [];
  const hasResults = resultGroups.some((g) => g.results.length > 0);

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
          {hasQuery && !hasResults && !isFetching && navMatches.length === 0 && (
            <CommandEmpty>No matches for &ldquo;{input.trim()}&rdquo;.</CommandEmpty>
          )}

          {/* Go to — navigation shortcuts, always available */}
          {navMatches.length > 0 && (
            <CommandGroup heading="Go to">
              {navMatches.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`nav:${item.label}:${item.href}`}
                    onSelect={() => go(item.href)}
                  >
                    <Icon className="text-muted-foreground" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/60" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Server-grouped, deep-linked, enrolment-scoped results */}
          {resultGroups.map((group) => (
            <CommandGroup key={group.type} heading={group.label}>
              {group.results.map((r: SearchResult) => {
                const Icon = iconForHint(r.iconHint);
                return (
                  <CommandItem
                    key={`${r.type}:${r.id}`}
                    value={`${r.type}:${r.id}:${r.title}`}
                    onSelect={() => go(r.href)}
                  >
                    <Icon className="text-muted-foreground" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{r.title}</span>
                      {r.subtitle && (
                        <span className="truncate text-xs text-muted-foreground">
                          {r.subtitle}
                        </span>
                      )}
                    </span>
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 opacity-0 group-data-[selected=true]:opacity-100" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}

          {isFetching && hasQuery && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Searching…
            </div>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
