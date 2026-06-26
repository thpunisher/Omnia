# Keyboard and Search

## Global Search

Omnia includes global search through the `QuickSearch` component and shared search store. The sidebar exposes search as a command with the shortcut label:

```text
Command+K
```

On Windows or Linux builds, the equivalent system shortcut may map to the control key depending on the desktop environment and future shortcut handling.

## Search Scope

The search UI is intended to help users jump across workspace content. The shared search store controls whether the search dialog is open.

Code locations:

```text
src/shared/components/QuickSearch.tsx
src/shared/store/searchStore.ts
```

## Navigation

Primary app routes:

| Route | Area |
| --- | --- |
| `/` | Dashboard |
| `/tasks` | Tasks |
| `/notes` | Notes |
| `/notes/:id` | Note editor |
| `/calendar` | Calendar |
| `/habits` | Habits |
| `/goals` | Goals |
| `/reminders` | Reminders |
| `/settings` | Settings |
