# Contributing to Omnia

Thank you for wanting to help build Omnia! This guide covers everything you need to get started.

## Ways to contribute

- 🐛 **Bug fixes** — find something broken? Open an issue first, then a PR
- ✨ **Features** — check the roadmap and open issues before building something large
- 🎨 **Themes** — the easiest contribution; see [docs/THEMES.md](docs/THEMES.md)
- 📖 **Documentation** — improve the docs, fix typos, add examples
- 🌍 **Translations** — i18n support is on the roadmap

## Development setup

```bash
git clone https://github.com/your-username/omnia.git
cd omnia
npm install
npm run tauri dev
```

## Project structure

Each feature lives in `src/features/<name>/` and contains:
- `types/` — TypeScript interfaces
- `services/` — Direct SQLite queries (no business logic)
- `store/` — Zustand store (optimistic updates, no redundant re-fetches)
- `components/` — React components

**Rules for feature code:**
- Never import from another feature's store or service directly — use the store's exposed actions
- Services must use parameterized queries (`?` bind values) — never string interpolation
- Every mutation must be optimistic with rollback on failure

## Adding a feature

1. Create `src/features/your-feature/` with the structure above
2. Add a SQLite migration in `src-tauri/migrations/` (increment the version number)
3. Register the migration in `src-tauri/src/lib.rs` → `migrations()`
4. Add a route in `src/app/App.tsx`
5. Add a nav item in `src/shared/components/MainLayout.tsx`
6. Wire it into the global search in `src/shared/components/QuickSearch.tsx`

## Adding a theme

See [docs/THEMES.md](docs/THEMES.md).

## Code style

- TypeScript strict mode — no `any` except where explicitly justified with a comment
- No unused imports (enforced by `tsc`)
- Stores must use optimistic updates with rollback
- `safeFormat()` instead of raw `format(new Date(value), ...)` — prevents RangeError

## Pull request checklist

- [ ] `npm run build` passes with no TypeScript errors
- [ ] The feature works in `npm run tauri dev`
- [ ] No `console.log` left in production code
- [ ] PR description explains what changed and why

## Commit messages

Follow [Conventional Commits](https://conventionalcommits.org/):
```
feat: add habit streak display
fix: notes page capped at 5 items
theme: add crimson dark theme
docs: update AI setup guide
```
