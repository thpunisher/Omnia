# Feature Modules

This page describes each feature module and where to extend it.

## Auth

Path:

```text
src/features/auth/
```

Responsibilities:

- Registration and sign-in UI.
- Session restoration.
- Logout.
- Store integration with Tauri auth commands.

The app renders `AuthPage` until `useAuthStore` has an active user.

## Dashboard

Path:

```text
src/features/dashboard/
```

Responsibilities:

- Signed-in home page.
- Workspace overview.
- Entry point to the main productivity areas.

## Tasks

Path:

```text
src/features/tasks/
```

Responsibilities:

- Create tasks.
- List and filter tasks.
- Update status and priority.
- Persist task records in SQLite.

## Notes

Path:

```text
src/features/notes/
```

Responsibilities:

- Create notes.
- Edit notes.
- Manage note folders.
- Store rich editor content.

The rich editor UI is implemented in the editor feature:

```text
src/features/editor/
```

## Calendar

Path:

```text
src/features/calendar/
```

Responsibilities:

- Month-style event workflow.
- Create events.
- Persist event dates, locations, and descriptions.

## Habits

Path:

```text
src/features/habits/
```

Responsibilities:

- Create habits.
- Toggle completion.
- Store habit logs for dates.
- Calculate visible completion and streak state.

## Goals

Path:

```text
src/features/goals/
```

Responsibilities:

- Create goals.
- Track progress.
- Update progress toward target.
- Mark goals completed or archived.

## Reminders

Path:

```text
src/features/reminders/
```

Responsibilities:

- Create due-date reminders.
- Display completion state.
- Highlight time-sensitive items.

## Settings

Path:

```text
src/features/settings/
```

Responsibilities:

- Theme selection.
- AI provider setup.
- User-facing configuration.

## AI

Path:

```text
src/features/ai/
```

Responsibilities:

- Provider settings.
- Model listing.
- Chat request execution.
- Error and loading state.
