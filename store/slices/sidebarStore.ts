"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
}

/**
 * Persisted side-rail collapse flag. Drives the desktop rail's
 * narrow-icon-only ↔ icon+label-inline state. Mobile bottom nav is
 * unaffected.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (next) => set({ collapsed: next }),
    }),
    { name: "smarthub-lms-new.sidebar-collapsed.v1" }
  )
);
