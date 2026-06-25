import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AISettings, ChatMessage, AIModel } from "../types/ai";
import { aiService } from "../services/aiService";

let _abortController: AbortController | null = null;

interface AIState {
  settings: AISettings;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  models: AIModel[];
  modelsLoading: boolean;

  updateSettings: (s: Partial<AISettings>) => void;
  /** Send a user message. Pass systemPrompt to inject a system message at the
   *  start of the conversation (only injected once per chat session). */
  sendMessage: (content: string, systemPrompt?: string) => Promise<void>;
  cancelMessage: () => void;
  clearHistory: () => void;
  fetchModels: () => Promise<void>;
  ask: (systemPrompt: string, userInput: string) => Promise<string>;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      settings: {
        provider: "openrouter",
        model: "anthropic/claude-sonnet-4.5",
        apiKey: "",
        baseUrl: "http://localhost:11434",
      },
      messages: [],
      isLoading: false,
      error: null,
      models: [],
      modelsLoading: false,

      updateSettings: (newSettings) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
        if (newSettings.provider) get().fetchModels();
      },

      fetchModels: async () => {
        set({ modelsLoading: true });
        try {
          const models = await aiService.listModels(get().settings);
          set({ models, modelsLoading: false });
        } catch {
          set({ modelsLoading: false });
        }
      },

      sendMessage: async (content, systemPrompt) => {
        const { settings, messages } = get();

        // Inject system message at the start only if none exists yet and
        // a systemPrompt was provided.
        const base: ChatMessage[] = (systemPrompt && !messages.some(m => m.role === "system"))
          ? [{ role: "system", content: systemPrompt, timestamp: Date.now() }]
          : [];

        const userMessage: ChatMessage = { role: "user", content, timestamp: Date.now() };
        const updated = [...messages, ...base, userMessage];

        set({ messages: updated, isLoading: true, error: null });
        _abortController = new AbortController();

        try {
          const reply = await aiService.chat(updated, settings);
          const assistantMessage: ChatMessage = {
            role: "assistant", content: reply, timestamp: Date.now(),
          };
          set({ messages: [...updated, assistantMessage], isLoading: false });
        } catch (err) {
          const msg = (err as Error).message;
          if (msg === "AbortError" || msg.includes("aborted")) {
            set({ isLoading: false, error: null });
          } else {
            set({ error: msg, isLoading: false });
          }
        } finally {
          _abortController = null;
        }
      },

      cancelMessage: () => {
        _abortController?.abort();
        _abortController = null;
        set({ isLoading: false });
      },

      ask: async (systemPrompt, userInput) =>
        aiService.ask(systemPrompt, userInput, get().settings),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: "omnia-ai-storage",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
