# User Guide

This guide explains the main user workflows inside Omnia.

## First Launch

1. Open Omnia.
2. Register a local account.
3. Use the sidebar to move between Home, Tasks, Notes, Calendar, Habits, Goals, Reminders, and Settings.
4. Use the theme toggle in the sidebar or Settings to switch appearance.

## Dashboard

The Dashboard is the home route at `/`. It is the first signed-in view and acts as the workspace entry point.

Use it to quickly understand the state of the workspace before jumping into a specific area.

## Tasks

Tasks support:

- Title.
- Optional description.
- Status: `todo`, `in_progress`, or `done`.
- Priority: `low`, `medium`, or `high`.
- Optional due date.

Typical workflow:

1. Open Tasks from the sidebar.
2. Create a task.
3. Assign priority and due date when needed.
4. Move the task through status filters as work progresses.

## Notes

Notes support:

- Title.
- Rich editor content.
- Tags.
- Optional folder.
- Optional icon.

The note editor is built with Tiptap and supports a Notion-style editing surface. The editor area includes rich text extensions such as headings, lists, tables, images, code blocks, links, highlights, blockquotes, and task lists.

## Note Folders

Folders are stored separately from notes and can be nested through `parent_id`. A note can belong to a folder through `folder_id`.

Use folders to separate projects, personal areas, and reference material.

## Calendar

Calendar events support:

- Title.
- Start date.
- Optional end date.
- Optional location.
- Optional description.

Open Calendar from the sidebar to view and create dated events.

## Habits

Habits support a title and frequency. Completion records are stored as habit logs, which makes it possible to track streaks and daily completion.

Typical workflow:

1. Create a habit.
2. Check it off when completed for the day.
3. Review streak and completion state in the Habits page.

## Goals

Goals track progress against a target number.

Fields:

- Title.
- Current progress.
- Target.
- Status: `active`, `completed`, or `archived`.

Use goals for measurable outcomes such as pages written, workouts completed, study hours, or project milestones.

## Reminders

Reminders support:

- Title.
- Due date.
- Completion state.

Use reminders for time-sensitive items that do not need the full task workflow.

## Settings

Settings is where the user configures appearance and AI. It is also the place to select providers, enter API keys, and choose models.
