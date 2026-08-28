"use client";
import { create } from "zustand";

interface UiState {
  sideNavCollapsed: boolean;
  toggleSideNav: () => void;
  /** Global command-palette (⌘K) open state. Shared between the
   *  layout-mounted keyboard listener and the top-bar trigger so both
   *  drive the same dialog. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sideNavCollapsed: false,
  toggleSideNav: () => set((s) => ({ sideNavCollapsed: !s.sideNavCollapsed })),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
}));
