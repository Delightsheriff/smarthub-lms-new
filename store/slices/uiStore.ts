"use client";
import { create } from "zustand";

interface UiState {
  /** Global command-palette (⌘K) open state. Shared between the
   *  layout-mounted keyboard listener and the top-bar trigger so both
   *  drive the same dialog. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
}));
