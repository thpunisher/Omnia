# Architecture

Omnia is organized as a desktop-first React application inside a Tauri shell.

## Top-Level Layout

```text
omnia/
├── src/
│   ├── app/
│   ├── features/
│   └── shared/
├── src-tauri/
│   ├── src/
│   ├── migrations/
│   ├── capabilities/
│   └── tauri.conf.json
└── docs/
```

## Frontend Boot Flow

The React app starts in:

```text
src/app/main.tsx
```

Main application routing and session restoration happen in:

```text
src/app/App.tsx
```

Boot sequence:

1. Apply the cached theme from `localStorage`.
2. Restore the local auth session.
3. Load the saved persisted theme from the database.
4. Show the auth screen if no user is active.
5. Render the main layout and lazy-loaded routes after sign-in.

## Routing

Routes are lazy-loaded by feature page:

| Route | Component |
| --- | --- |
| `/` | `DashboardPage` |
| `/tasks` | `TasksPage` |
| `/notes` | `NotesPage` |
| `/notes/:id` | `NoteEditorPage` |
| `/calendar` | `CalendarPage` |
| `/habits` | `HabitsPage` |
| `/goals` | `GoalsPage` |
| `/reminders` | `RemindersPage` |
| `/settings` | `SettingsPage` |

## Feature Slice Pattern

Most product areas follow this structure:

```text
src/features/<feature>/
├── components/
├── services/
├── store/
└── types/
```

This keeps UI, persistence, state, and TypeScript contracts close to the feature they support.

## Shared Layer

Shared code lives under:

```text
src/shared/
```

Important shared areas:

- `components`: main layout, search, app entrance, error boundary, and reusable UI.
- `services`: SQLite helper.
- `store`: cross-feature stores such as theme and search.
- `themes`: theme schema, built-in themes, and theme loader.
- `lib`: utility functions and splash helpers.

## Desktop Layer

Tauri code lives under:

```text
src-tauri/
```

The Rust layer handles desktop integration, Tauri command registration, migrations, capabilities, and local auth behavior. The JavaScript side communicates with SQLite through `@tauri-apps/plugin-sql`.

## Styling

Omnia uses Tailwind CSS and theme-driven CSS custom properties. Themes define semantic colors such as `base`, `surface`, `textPrimary`, and `accent`, then the UI consumes those variables across components.
