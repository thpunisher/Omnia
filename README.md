<div align="center">
  <img src="public/tauri.svg" width="80" height="80" alt="Omnia logo" />
  <h1>Omnia</h1>
  <p><strong>A Notion-level personal productivity workspace built with Tauri, React, and SQLite.</strong></p>
  <p>Tasks · Notes · Calendar · Habits · Goals · Reminders · AI Assistant</p>

  <a href="https://github.com/thpunisher/omnia/releases"><img src="https://img.shields.io/github/v/release/thpunisher/omnia?style=flat-square&color=5E6AD2" alt="Latest release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/thpunisher/omnia?style=flat-square&color=5E6AD2" alt="License" /></a>
  <a href="https://github.com/thpunisher/omnia/issues"><img src="https://img.shields.io/github/issues/thpunisher/omnia?style=flat-square&color=5E6AD2" alt="Open issues" /></a>
  <a href="https://github.com/thpunisher/omnia/stargazers"><img src="https://img.shields.io/github/stars/thpunisher/omnia?style=flat-square&color=5E6AD2" alt="Stars" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/contributions-welcome-5E6AD2?style=flat-square" alt="Contributions welcome" /></a>
</div>

---

## What is Omnia?

Omnia is a **free, open-source, privacy-first desktop productivity app** that brings together everything you need in one place. Your data lives entirely on your machine — no subscriptions, no telemetry, no cloud dependency (optional sync coming).

It's designed as a Notion alternative you can actually extend. Contributors can build **custom themes** and (soon) **plugins** that plug into Omnia's open API.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 **Notes** | Full Notion-style block editor with tables, images, code blocks, to-do lists, and `/` commands |
| 📁 **Note Folders** | Organize notes into nested folders with inline rename and drag support |
| ✅ **Tasks** | Priority-sorted task list with filter tabs (All / Todo / Done) |
| 📅 **Calendar** | Month view with event creation directly on calendar days |
| 🔄 **Habits** | Daily habit tracker with streak calculation and check-in toggle |
| 🎯 **Goals** | Progress tracking with animated bars and +1/+10 increments |
| 🔔 **Reminders** | Due-date reminders with overdue highlighting |
| 🤖 **AI Assistant** | Chat with any AI model via OpenRouter, OpenAI, or local Ollama. AI can **take actions** — create tasks, create notes, navigate the app |
| 🎨 **Themes** | Full theme system with light/dark built-in and a JSON schema for contributor themes |
| 🔍 **Global Search** | `⌘K` full-text search across all your content |
| 🔐 **Local Auth** | Account system with Argon2id password hashing, ready for cloud sync |

---

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/) (stable)
- [Tauri prerequisites](https://tauri.app/v2/guides/getting-started/prerequisites/) for your OS

### Install & run

```bash
git clone https://github.com/your-username/omnia.git
cd omnia
npm install
npm run tauri dev
```

First launch will open a registration screen — create a local account to get started. All data is stored in your app data directory.

### Build for production

```bash
npm run tauri build
```

The compiled binary and installer will be in `src-tauri/target/release/bundle/`.

---

## 🤖 AI setup

Omnia supports three AI providers:

### OpenRouter (recommended — access to 200+ models)
1. Get a free API key at [openrouter.ai/keys](https://openrouter.ai/keys)
2. Open **Settings → AI**, choose OpenRouter, paste your key
3. Pick a model (Claude, GPT, Gemini, Llama, etc.)

### OpenAI
1. Get an API key at [platform.openai.com](https://platform.openai.com)
2. Open **Settings → AI**, choose OpenAI, paste your key

### Ollama (fully local, no API key)
1. Install [Ollama](https://ollama.ai) and pull a model: `ollama pull llama3`
2. Open **Settings → AI**, choose Ollama
3. Set the base URL if different from `http://localhost:11434`

Once configured, the AI can take **real actions** — try:
- *"Add a task to review the quarterly report, high priority"*
- *"Create a note called Meeting Notes"*
- *"Take me to my calendar"*

---

## 🎨 Building a theme

Themes are JSON objects that implement the `OmniaTheme` interface. See [`src/shared/themes/theme.types.ts`](src/shared/themes/theme.types.ts) for the full schema.

**Quick example — a red dark theme:**

```json
{
  "id": "crimson",
  "name": "Crimson",
  "description": "A deep red dark theme",
  "mode": "dark",
  "author": "your-username",
  "version": "1.0.0",
  "colors": {
    "base":           "#0d0a0a",
    "surface":        "#150f0f",
    "overlay":        "#1e1515",
    "border":         "#2d1f1f",
    "muted":          "#3d2a2a",
    "textPrimary":    "#f0e0e0",
    "textSecondary":  "#997777",
    "textTertiary":   "#664444",
    "accent":         "#DC2626",
    "accentHover":    "#EF4444",
    "accentDim":      "rgba(220,38,38,0.15)",
    "success":        "#4ade80",
    "warning":        "#fb923c",
    "danger":         "#fca5a5"
  },
  "typography": {
    "fontSans": "ui-sans-serif, system-ui, -apple-system, sans-serif",
    "fontMono": "ui-monospace, monospace",
    "baseFontSize": 15,
    "lineHeight": 1.5
  },
  "radii": {
    "sm": "4px",
    "md": "6px",
    "lg": "10px",
    "xl": "14px"
  }
}
```

**How to share your theme:**
1. Fork this repo
2. Add your theme file to `src/shared/themes/` following the naming convention `<id>.theme.ts`
3. Register it in `src/shared/themes/themeLoader.ts` → `BUILTIN_THEMES` array
4. Open a PR with the tag `theme`

See [`docs/THEMES.md`](docs/THEMES.md) for the complete theme guide.

---

## 🔌 Plugin system (roadmap)

The plugin API is on the roadmap. The codebase is architected to support it:

- Each feature is a self-contained slice (`store` + `service` + `types` + `components`) with no cross-feature coupling
- `themeRegistry.register(theme)` is the current contributor API surface
- The future plugin loader will read `~/.omnia/plugins/*.js`, validate against a permission model, and call into the same store/service APIs

See [`docs/PLUGINS.md`](docs/PLUGINS.md) for the planned API.

---

## 🏗️ Architecture

```
omnia/
├── src/
│   ├── app/              # React entry, global CSS, routing
│   ├── features/         # One folder per feature (self-contained slices)
│   │   ├── ai/           # AI chat + store + service (OpenRouter/OpenAI/Ollama)
│   │   ├── auth/         # Login/register + local auth store
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   ├── editor/       # Tiptap editor + slash commands + AI bar
│   │   ├── goals/
│   │   ├── habits/
│   │   ├── notes/        # Notes + folder tree
│   │   ├── reminders/
│   │   ├── settings/
│   │   └── tasks/
│   └── shared/
│       ├── components/   # Layout, search, error boundary
│       ├── lib/          # utils, splash
│       ├── services/     # SQLite db.ts
│       ├── store/        # Theme store, search store
│       └── themes/       # Theme schema, built-in themes, loader
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs        # Tauri commands (auth, theme pref, splash)
│   │   └── main.rs
│   ├── migrations/       # SQLite schema migrations
│   ├── capabilities/     # Tauri v2 permissions
│   └── tauri.conf.json
└── docs/                 # Extended documentation
```

**Tech stack:**
- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, Framer Motion, Zustand
- **Editor:** Tiptap v3 (tables, images, slash commands, bubble menu)
- **Desktop shell:** Tauri v2
- **Database:** SQLite via `tauri-plugin-sql` (JS) + `sqlx` (Rust auth)
- **Auth:** Argon2id password hashing (Rust), session in Tauri managed state
- **AI:** OpenRouter, OpenAI, Ollama — swappable via Settings

---

## 🤝 Contributing

Contributions are very welcome! Omnia is designed so you can add a feature without touching other parts of the codebase.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Quick version:

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Run `npm run build` to confirm no TypeScript errors
4. Open a PR describing what you built and why

**Good first issues** are tagged [`good first issue`](https://github.com/thpunisher/omnia/issues?q=label%3A%22good+first+issue%22) on GitHub.

---

## 📋 Roadmap

- [ ] Cloud sync (backend-agnostic, bring your own Supabase/PocketBase)
- [ ] OS notifications for Reminders
- [ ] Plugin loader (JS sandboxed plugins from `~/.omnia/plugins/`)
- [ ] Theme marketplace
- [ ] Mobile (Tauri mobile target)
- [ ] Export to JSON / Markdown
- [ ] Collaborative notes (CRDT-based)

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by the Omnia community</sub>
</div>
