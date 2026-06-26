# Troubleshooting

## `no such table` Database Errors

Cause: the frontend connected to a SQLite database that did not receive migrations.

Check:

- `src/shared/services/db.ts` uses `sqlite:omnia.db`.
- Tauri migration registration uses the same database connection.
- The app was launched through Tauri, not only through Vite, when testing database features.

## Tauri Dev Fails Before Opening

Check prerequisites:

- Node.js 18 or newer.
- Rust stable installed.
- Tauri OS dependencies installed.
- `npm install` completed successfully.

Then retry:

```bash
npm run tauri dev
```

## Frontend Build Fails

Run:

```bash
npm run build
```

Read the first TypeScript error in the output. Later errors are often caused by the first failure.

## AI Provider Returns an Error

Common causes:

- Missing API key.
- Invalid API key.
- Provider rate limit.
- Model ID not available for the selected provider.
- Ollama is not running.
- Ollama base URL is wrong.

For Ollama, verify the local server:

```bash
ollama list
```

## Theme Does Not Appear

Check:

- The theme file exports a valid `OmniaTheme`.
- The theme is registered in `themeLoader.ts`.
- The theme `id` is unique.
- The app was restarted after adding the theme.

## Docs Site Shows a Blank Page

Serve the `docs/` folder through a local static server instead of opening `index.html` directly:

```bash
npx docsify-cli serve docs
```

Then open:

```text
http://localhost:3000
```
