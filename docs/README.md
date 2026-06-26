# Omnia Documentation

Omnia is a free, open-source, privacy-first desktop productivity app. It combines a personal dashboard, tasks, notes, calendar events, habits, goals, reminders, local authentication, themes, global search, and an AI assistant in one Tauri desktop application.

This documentation website is built with Docsify. It is intentionally separate from the app runtime: Docsify renders these Markdown files directly in the browser, so the docs can be previewed without compiling the Omnia app.

## What Omnia Includes

| Area | What it does |
| --- | --- |
| Dashboard | Gives the user a home view for their workspace. |
| Tasks | Tracks todo, in-progress, and done work with low, medium, and high priority. |
| Notes | Provides folder-backed notes and a rich editor experience. |
| Calendar | Stores dated events with optional end date, location, and description. |
| Habits | Tracks recurring habits and completion logs. |
| Goals | Tracks progress toward numeric targets. |
| Reminders | Tracks due-date reminders and completion state. |
| AI Assistant | Connects to OpenRouter, OpenAI, or local Ollama models. |
| Themes | Applies built-in or contributor-created light and dark themes. |
| Auth | Uses local accounts with password hashing on the Tauri side. |

## Documentation Map

- [Getting Started](getting-started.md): install prerequisites, run the desktop app, and build a release.
- [Configuration](configuration.md): app settings, AI provider setup, local storage, and themes.
- [User Guide](user-guide.md): practical workflows for each product area.
- [Architecture](architecture.md): codebase layout, frontend structure, desktop shell, and state model.
- [Data Model](data-model.md): SQLite tables, TypeScript types, and persistence notes.
- [AI Assistant](ai-assistant.md): providers, model selection, local Ollama setup, and known limits.
- [Themes](THEMES.md): custom theme schema and contribution process.
- [Plugins Roadmap](PLUGINS.md): planned plugin architecture and permissions.

## Privacy Model

Omnia stores user data locally in the desktop app data directory. Core productivity data is stored in SQLite through the Tauri SQL plugin. Authentication is local to the app. AI requests are sent only when the user configures and uses an AI provider; Ollama can be used for fully local model execution.

## Current Tech Stack

- React 19 and TypeScript for the UI.
- Vite for frontend development and bundling.
- Tauri v2 for the desktop shell.
- SQLite through `tauri-plugin-sql` and Rust-side migrations.
- Zustand for feature stores.
- Tiptap for the rich note editor.
- Tailwind CSS v4 and local CSS variables for styling.
- OpenRouter, OpenAI, and Ollama for AI provider support.
