"use client";
import { useEffect } from "react";
import { useUiStore } from "@/store/slices/uiStore";

/**
 * App-wide host for the global command palette.
 *
 * Registers the ⌘K / Ctrl-K shortcut once and flips the shared
 * `ui.searchOpen` flag, so the top-bar search trigger and the shortcut
 * both drive the same dialog. Mounted in the `(app)` shell next to
 * `MessageToastListener`.
 *
 * The palette *dialog* itself deliberately does not exist yet — Plan 003
 * only opens the flag (listener only, per user decision). The paletted
 * UI + command results land with the global search slice (Plan 009).
 */
export function CommandPaletteListener() {
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

  return null;
}
