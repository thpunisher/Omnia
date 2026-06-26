# Contributing

Omnia is structured so contributors can work inside a feature without touching unrelated areas.

## Local Setup

```bash
npm install
npm run tauri dev
```

Before opening a pull request, run:

```bash
npm run build
```

For desktop-specific changes, also run:

```bash
npm run tauri build
```

## Where to Make Changes

| Change type | Start here |
| --- | --- |
| Task workflow | `src/features/tasks/` |
| Notes workflow | `src/features/notes/` and `src/features/editor/` |
| Calendar workflow | `src/features/calendar/` |
| Habit workflow | `src/features/habits/` |
| Goal workflow | `src/features/goals/` |
| Reminder workflow | `src/features/reminders/` |
| AI behavior | `src/features/ai/` |
| Theme behavior | `src/shared/themes/` |
| Shared UI | `src/shared/components/` |
| Database schema | `src-tauri/migrations/` |
| Tauri commands | `src-tauri/src/` |

## Feature Pattern

Prefer the existing feature-slice pattern:

```text
components/
services/
store/
types/
```

Use a service file for persistence logic, a store for state coordination, type files for contracts, and components for rendering.

## Database Changes

When adding persistent data:

1. Add a new migration under `src-tauri/migrations/`.
2. Update or add TypeScript types for the feature.
3. Update the service layer to read and write the new fields.
4. Keep migration SQL compatible with SQLite.

## Theme Contributions

Theme contributions should include:

- A theme file in `src/shared/themes/`.
- Registration in `themeLoader.ts`.
- A screenshot in the pull request.
- A short description of the use case and contrast choices.

See [Themes](THEMES.md).

## Plugin Contributions

The plugin system is planned but not implemented. Contributors interested in it should start with [Plugins Roadmap](PLUGINS.md) and focus on the permission model, Tauri scanning command, and frontend sandbox bridge.

## Pull Request Checklist

- The change is scoped to the feature or shared area it affects.
- TypeScript builds successfully.
- Desktop-specific changes were tested through Tauri.
- New persistent data has a migration.
- User-facing changes are documented when needed.
