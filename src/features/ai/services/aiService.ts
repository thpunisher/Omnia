import { AISettings, ChatMessage, AIModel, OPENROUTER_FALLBACK_MODELS, OPENAI_MODELS } from "../types/ai";

const AI_TIMEOUT_MS = 30_000; // 30 s — long enough for slow local models

/** Wraps fetch with an AbortController timeout.
 *  Rejects with a human-readable message on timeout rather than hanging forever. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = AI_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. Check your connection or try a faster model.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface AIProviderService {
  chat(messages: ChatMessage[], settings: AISettings): Promise<string>;
  listModels(settings: AISettings): Promise<AIModel[]>;
}

const toApiMessages = (messages: ChatMessage[]) =>
  messages.map((m) => ({ role: m.role, content: m.content }));

export const openRouterService: AIProviderService = {
  chat: async (messages, settings) => {
    if (!settings.apiKey) throw new Error("OpenRouter API key required. Add it in Settings.");
    if (!settings.model) throw new Error("Pick a model in Settings first.");

    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
          "HTTP-Referer": "https://omnia.app",
          "X-Title": "Omnia",
        },
        body: JSON.stringify({ model: settings.model, messages: toApiMessages(messages) }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      if (response.status === 401) throw new Error("Invalid OpenRouter API key.");
      if (response.status === 402) throw new Error("OpenRouter account is out of credits.");
      if (response.status === 429) throw new Error("Rate limited by OpenRouter — try again shortly.");
      throw new Error(`OpenRouter error (${response.status}): ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned an empty response.");
    return content;
  },

  listModels: async (settings) => {
    try {
      const headers: Record<string, string> = {};
      if (settings.apiKey) headers.Authorization = `Bearer ${settings.apiKey}`;
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/models",
        { headers },
        10_000
      );
      if (!response.ok) return OPENROUTER_FALLBACK_MODELS;
      const data = await response.json();
      const models: AIModel[] = (data?.data ?? []).map((m: any) => ({
        id: m.id,
        name: m.name ?? m.id,
        provider: "openrouter" as const,
        contextLength: m.context_length,
        description: m.description,
      }));
      return models.length > 0 ? models : OPENROUTER_FALLBACK_MODELS;
    } catch {
      return OPENROUTER_FALLBACK_MODELS;
    }
  },
};

export const openAIService: AIProviderService = {
  chat: async (messages, settings) => {
    if (!settings.apiKey) throw new Error("OpenAI API key required. Add it in Settings.");

    const response = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({ model: settings.model, messages: toApiMessages(messages) }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error("Invalid OpenAI API key.");
      if (response.status === 429) throw new Error("Rate limited by OpenAI — try again shortly.");
      const body = await response.text().catch(() => "");
      throw new Error(`OpenAI error (${response.status}): ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned an empty response.");
    return content;
  },

  listModels: async () => OPENAI_MODELS,
};

export const ollamaService: AIProviderService = {
  chat: async (messages, settings) => {
    const base = settings.baseUrl || "http://localhost:11434";
    let response: Response;
    try {
      response = await fetchWithTimeout(
        `${base}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: settings.model,
            messages: toApiMessages(messages),
            stream: false,
          }),
        },
        60_000 // Ollama on slow hardware can take longer
      );
    } catch (err) {
      if ((err as Error).message.includes("timed out")) throw err;
      throw new Error(`Couldn't reach Ollama at ${base}. Is it running?`);
    }

    if (!response.ok) throw new Error(`Ollama error (${response.status})`);
    const data = await response.json();
    if (!data?.message?.content) throw new Error("Ollama returned an empty response.");
    return data.message.content;
  },

  listModels: async (settings) => {
    try {
      const base = settings.baseUrl || "http://localhost:11434";
      const response = await fetchWithTimeout(`${base}/api/tags`, {}, 5_000);
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models ?? []).map((m: any) => ({
        id: m.name, name: m.name, provider: "ollama" as const,
      }));
    } catch {
      return [];
    }
  },
};

export const aiService = {
  getProvider: (provider: AISettings["provider"]): AIProviderService => {
    switch (provider) {
      case "openrouter": return openRouterService;
      case "openai":     return openAIService;
      case "ollama":     return ollamaService;
      default:           return openRouterService;
    }
  },

  chat: (messages: ChatMessage[], settings: AISettings) =>
    aiService.getProvider(settings.provider).chat(messages, settings),

  listModels: (settings: AISettings) =>
    aiService.getProvider(settings.provider).listModels(settings),

  ask: (systemPrompt: string, userInput: string, settings: AISettings) =>
    aiService.getProvider(settings.provider).chat(
      [
        { role: "system", content: systemPrompt, timestamp: Date.now() },
        { role: "user",   content: userInput,    timestamp: Date.now() },
      ],
      settings
    ),
};
