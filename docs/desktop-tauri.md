# Desktop and Tauri

Omnia uses Tauri v2 to package the React application as a desktop app.

## Main Files

```text
src-tauri/src/main.rs
src-tauri/src/lib.rs
src-tauri/tauri.conf.json
src-tauri/capabilities/default.json
src-tauri/migrations/
```

## Responsibilities

The Tauri layer is responsible for:

- Creating the desktop runtime.
- Registering plugins.
- Running database migrations.
- Providing Rust commands to the frontend.
- Managing local auth behavior.
- Defining desktop permissions through capabilities.

## SQLite

The app uses `tauri-plugin-sql`. JavaScript loads the database with:

```text
sqlite:omnia.db
```

Migrations are stored under `src-tauri/migrations/` and run through the Tauri-side SQL setup.

## Auth

Local authentication is implemented with a Rust-side command surface and a frontend Zustand store. Password hashes are stored in SQLite, not plaintext.

## Capabilities

Tauri v2 uses capabilities to define what the frontend is allowed to access. Omnia keeps the default capability file here:

```text
src-tauri/capabilities/default.json
```

When adding a new Tauri plugin or command, check whether the app capability configuration also needs to be updated.

## Development Command

```bash
npm run tauri dev
```

## Production Build

```bash
npm run tauri build
```

If a production build fails, check both the frontend TypeScript build and the Rust/Tauri output. Tauri builds exercise both layers.
