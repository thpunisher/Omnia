import { invoke } from "@tauri-apps/api/core";

/**
 * Signals the Tauri backend that React has mounted and the first paint is
 * ready, so it can close the splashscreen window and reveal + maximize the
 * main window (see src-tauri-patch/src/lib.rs::close_splashscreen).
 *
 * Safe to call outside Tauri (e.g. `vite dev` in a plain browser tab) — it
 * silently no-ops instead of throwing, so web-only development isn't broken.
 */
export async function signalAppReady(): Promise<void> {
  const isTauri = "__TAURI_INTERNALS__" in window;
  if (!isTauri) return;

  try {
    await invoke("close_splashscreen");
  } catch {
    // Backend command not registered yet, or running in a context without
    // the splashscreen window — fail silently, the main window's default
    // visibility will still apply.
  }
}
