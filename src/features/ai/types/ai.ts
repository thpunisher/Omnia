export type AIProvider = "openrouter" | "openai" | "ollama";

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextLength?: number;
  description?: string;
}

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

/** Small curated safety net shown only if the live OpenRouter /models fetch fails. */
export const OPENROUTER_FALLBACK_MODELS: AIModel[] = [
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "openrouter" },
  { id: "openai/gpt-5", name: "GPT-5", provider: "openrouter" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "openrouter" },
  { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", provider: "openrouter" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", provider: "openrouter" },
];

export const OPENAI_MODELS: AIModel[] = [
  { id: "gpt-5", name: "GPT-5", provider: "openai" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "openai" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
];
