# AI Assistant

Omnia includes an AI assistant that can use hosted providers or a local model runtime.

## Supported Providers

| Provider | Endpoint | Best for |
| --- | --- | --- |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | Accessing many hosted models through one API key. |
| OpenAI | `https://api.openai.com/v1/chat/completions` | Using OpenAI chat models. |
| Ollama | `http://localhost:11434/api/chat` by default | Fully local AI on the user's machine. |

## OpenRouter Setup

1. Create an OpenRouter API key.
2. Open Omnia Settings.
3. Choose OpenRouter.
4. Paste the API key.
5. Pick a model.

Omnia can fetch model metadata from OpenRouter. If the model request fails, the app falls back to a built-in model list.

## OpenAI Setup

1. Create an OpenAI API key.
2. Open Omnia Settings.
3. Choose OpenAI.
4. Paste the API key.
5. Choose a supported model.

## Ollama Setup

Install Ollama, then pull a model:

```bash
ollama pull llama3
```

Start Ollama and keep the local service running. In Omnia Settings, choose Ollama and use:

```text
http://localhost:11434
```

If a different Ollama host or port is used, update the base URL in Settings.

## Timeouts and Errors

Hosted provider requests time out after about 30 seconds. Ollama requests allow about 60 seconds because local models can be slower on consumer hardware.

Common errors:

| Error | Meaning |
| --- | --- |
| API key required | Add the provider API key in Settings. |
| Invalid API key | The configured provider rejected the key. |
| Rate limited | Wait and retry, or switch model/provider. |
| Ollama unreachable | Ollama is not running or the base URL is wrong. |
| Empty response | The provider returned no assistant content. |

## Persistence

AI provider settings are persisted in browser storage through Zustand. Chat history can be cleared from the store behavior. API keys are user-provided and should be treated as sensitive local configuration.

## Implementation Files

```text
src/features/ai/components/AIAssistant.tsx
src/features/ai/services/aiService.ts
src/features/ai/store/aiStore.ts
src/features/ai/types/ai.ts
```
