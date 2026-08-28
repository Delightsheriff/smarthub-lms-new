"use client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/slices/uiStore";

/**
 * Top-bar entry point for the global command palette. Opens the shared
 * `ui.searchOpen` dialog (the ⌘K listener + palette host live in the
 * `(app)` shell). Desktop shows a labelled pill with the ⌘K hint;
 * mobile collapses to an always-visible icon button.
 */
export function SearchTrigger() {
  const setOpen = useUiStore((s) => s.setSearchOpen);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="hidden h-9 w-auto justify-start gap-2 rounded-lg border-border/70 bg-muted/40 px-3 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted hover:text-foreground md:inline-flex"
      >
        <Search className="size-4 shrink-0" />
        <span>Search&hellip;</span>
        <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-px font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
          ⌘K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="rounded-full md:hidden"
      >
        <Search className="size-5" />
      </Button>
    </>
  );
}
