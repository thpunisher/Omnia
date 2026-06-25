import { create } from "zustand";

interface SearchUIState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/** Drives the global Cmd+K search dialog's open state from anywhere in the app
 *  (sidebar button, keyboard shortcut) without synthetic DOM event hacks. */
export const useSearchStore = create<SearchUIState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
