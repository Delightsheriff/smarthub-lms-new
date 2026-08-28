"use client";
import { useEffect } from "react";
import { useUiStore } from "@/store/slices/uiStore";
import { CommandPalette } from "@/components/layout/command-palette";

/**
 * App-wide host for the global command palette.
 *
 * Registers the ⌘K / Ctrl-K shortcut once and flips the shared
 * `ui.searchOpen` flag, so the top-bar search trigger and the shortcut
 * both drive the same dialog. Renders the palette bound to that flag.
 * Mounted in the `(app)` shell next to `MessageToastListener`.
 */
export function CommandPaletteListener() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const toggle = useUiStore((s) => s.toggleSearch);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return <CommandPalette open={open} onOpenChange={setOpen} />;
}
