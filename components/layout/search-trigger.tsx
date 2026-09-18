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
        className="hidden h-9 w-52 sm:w-60 md:w-64 lg:w-72 xl:w-80 justify-between items-center gap-2 rounded-xl border-border/70 bg-muted/20 px-3 text-xs sm:text-sm font-normal text-muted-foreground shadow-2xs transition-[background-color,border-color,box-shadow,transform] duration-150 hover:bg-muted/50 hover:border-border hover:text-foreground active:scale-[0.99] md:inline-flex"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate text-xs text-muted-foreground">Search courses, lessons&hellip;</span>
        </div>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-border/80 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80 shadow-2xs lg:inline-flex shrink-0">
          ⌘K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.96] transition-[transform,background-color] md:hidden"
      >
        <Search className="size-4" />
      </Button>
    </>
  );
}

