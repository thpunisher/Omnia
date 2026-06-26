# Configuration

Omnia keeps most configuration inside the local desktop app. User-facing configuration is available from the Settings page after signing in.

## Local Account

The first launch shows registration. Omnia stores account records in the local SQLite database:

- `users.id`
- `users.email`
- `users.username`
- `users.password_hash`
- `users.created_at`

Passwords are hashed on the Rust/Tauri side with Argon2id before storage.

## Theme Preference

Theme preference is stored per user in the `user_preferences` table. The frontend also reads `localStorage` early during boot so the saved theme can be applied before the app finishes restoring the session.

Built-in themes are registered in:

```text
src/shared/themes/themeLoader.ts
```

Theme definitions live in:

```text
src/shared/themes/
```

See [Themes](THEMES.md) for the full schema.

## AI Providers

Omnia supports three AI provider modes:

| Provider | Configuration | Notes |
| --- | --- | --- |
| OpenRouter | API key and model ID | Good default for accessing many hosted models. |
| OpenAI | API key and model ID | Uses OpenAI chat completions. |
| Ollama | Local base URL and local model name | Runs locally when Ollama is installed and running. |

Default Ollama URL:

```text
http://localhost:11434
```

AI settings are persisted by the Zustand AI store under the `omnia-ai-storage` local storage key.

## Database Connection

The frontend SQL helper connects to:

```text
sqlite:omnia.db
```

This connection string must match the Tauri migration registration. Tauri resolves the relative database path inside the application data directory.

## Environment Files

The current app does not require a checked-in `.env` file for normal local use. API keys are entered through Settings.
