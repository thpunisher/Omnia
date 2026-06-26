# Data Model

Omnia persists core data in SQLite. Migrations live in:

```text
src-tauri/migrations/
```

The frontend database helper connects through:

```text
src/shared/services/db.ts
```

## Tasks

Table: `tasks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `title` | text | Required. |
| `description` | text | Optional. |
| `status` | text | `todo`, `in_progress`, or `done`. |
| `priority` | text | `low`, `medium`, or `high`. |
| `due_date` | text | Optional. |
| `created_at` | text | Created timestamp. |
| `updated_at` | text | Updated timestamp. |

## Notes

Table: `notes`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `title` | text | Required. |
| `content` | text | Rich editor content. |
| `tags` | text | Optional serialized tags. |
| `folder_id` | text | Optional folder reference. |
| `icon` | text | Optional note icon. |
| `created_at` | text | Created timestamp. |
| `updated_at` | text | Updated timestamp. |

## Note Folders

Table: `note_folders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `name` | text | Required. |
| `parent_id` | text | Optional parent folder. |
| `created_at` | text | Created timestamp. |

`parent_id` references `note_folders.id` and is set to null if the parent is deleted.

## Goals

Table: `goals`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `title` | text | Required. |
| `progress` | integer | Current progress. |
| `target` | integer | Target value. |
| `status` | text | `active`, `completed`, or `archived`. |
| `created_at` | text | Created timestamp. |

## Habits

Table: `habits`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `title` | text | Required. |
| `frequency` | text | Defaults to `daily`. |
| `created_at` | text | Created timestamp. |

Table: `habit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `habit_id` | text | References `habits.id`. |
| `date` | text | Completion date. |
| `completed` | integer | `1` for completed. |

## Reminders

Table: `reminders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `title` | text | Required. |
| `due_date` | text | Required. |
| `completed` | integer | `0` or `1`. |
| `created_at` | text | Created timestamp. |

## Calendar Events

Table: `events`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `title` | text | Required. |
| `start_date` | text | Required. |
| `end_date` | text | Optional. |
| `location` | text | Optional. |
| `description` | text | Optional. |

## Users

Table: `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text | Primary key. |
| `email` | text | Unique. |
| `username` | text | Display name. |
| `password_hash` | text | Argon2id hash. |
| `created_at` | text | Created timestamp. |

## User Preferences

Table: `user_preferences`

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | text | Primary key and user reference. |
| `theme_id` | text | Defaults to `dark`. |
| `updated_at` | text | Updated timestamp. |

## Migration Notes

The `sqlite:omnia.db` connection used by the frontend must match the database connection registered by Tauri migrations. If the names diverge, the frontend can connect to a database that has no tables.
