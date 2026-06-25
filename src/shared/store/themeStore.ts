import { create } from "zustand";
import { OmniaTheme } from "../themes/theme.types";
import { themeRegistry, applyThemeById } from "../themes/themeLoader";

interface ThemeState {
  activeThemeId: string;
  themes: OmniaTheme[];
  setTheme: (id: string) => Promise<void>;
  loadSavedTheme: () => Promise<void>;
}

const isTauri = () => "__TAURI_INTERNALS__" in window;

async function persistTheme(id: string): Promise<void> {
  if (!isTauri()) return;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("save_theme_preference", { themeId: id });
  } catch {
    // Not authenticated yet or running in browser dev — store falls back to
    // localStorage as a secondary cache so theme survives across dev reloads.
    localStorage.setItem("omnia-theme", id);
  }
}

async function fetchSavedTheme(): Promise<string> {
  if (!isTauri()) return localStorage.getItem("omnia-theme") ?? "dark";
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<string>("load_theme_preference");
  } catch {
    return localStorage.getItem("omnia-theme") ?? "dark";
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeThemeId: "dark",
  themes: themeRegistry.all(),

  setTheme: async (id) => {
    applyThemeById(id);
    localStorage.setItem("omnia-theme", id); // immediate local cache
    set({ activeThemeId: id });
    await persistTheme(id);
  },

  loadSavedTheme: async () => {
    const id = await fetchSavedTheme();
    applyThemeById(id);
    set({ activeThemeId: id, themes: themeRegistry.all() });
  },
}));
