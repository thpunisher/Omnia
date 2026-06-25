import { create } from "zustand";
import { persist } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await invoke<{ user: UserProfile; token: string }>(
            "register", { username, email, password }
          );
          set({ user: result.user, token: result.token, isLoading: false });
        } catch (err) {
          set({ error: err as string, isLoading: false });
          throw err;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await invoke<{ user: UserProfile; token: string }>(
            "login", { email, password }
          );
          set({ user: result.user, token: result.token, isLoading: false });
        } catch (err) {
          set({ error: err as string, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try { await invoke("logout"); } catch { /* already signed out */ }
        set({ user: null, token: null });
      },

      // Called on app boot to restore the Rust-side session from the
      // persisted token. If the Rust session has expired (app was restarted),
      // we clear the frontend state so the login screen shows.
      checkSession: async () => {
        const { token } = get();
        if (!token) { set({ user: null }); return; }
        try {
          const user = await invoke<UserProfile | null>("get_current_user");
          if (user) {
            set({ user });
          } else {
            // Rust session gone (e.g. app restart) — re-login needed.
            set({ user: null, token: null });
          }
        } catch {
          set({ user: null, token: null });
        }
      },

      updateProfile: async (username) => {
        set({ isLoading: true, error: null });
        try {
          const user = await invoke<UserProfile>("update_profile", { username });
          set({ user, isLoading: false });
        } catch (err) {
          set({ error: err as string, isLoading: false });
          throw err;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await invoke("change_password", { currentPassword, newPassword });
          set({ isLoading: false });
        } catch (err) {
          set({ error: err as string, isLoading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "omnia-auth",
      // Only persist the token (not the full profile — that comes from the
      // Rust session check on boot). Never persist passwords.
      partialize: (state) => ({ token: state.token }),
    }
  )
);
