# Getting Started

This page explains how to run Omnia locally as a desktop app. The documentation site itself is separate; see [Viewing These Docs](#viewing-these-docs).

## Prerequisites

Install these tools before running the app:

- Node.js 18 or newer.
- npm, included with Node.js.
- Rust stable through `rustup`.
- Tauri v2 operating-system prerequisites for your platform.

## Install Dependencies

From the repository root:

```bash
npm install
```

## Run the Desktop App

Start the Tauri development environment:

```bash
npm run tauri dev
```

On first launch, Omnia opens the local registration screen. Create a local account, then the main workspace becomes available.

## Run the Frontend Only

For UI-only development without the desktop shell:

```bash
npm run dev
```

This starts the Vite development server. Some Tauri-specific features may not work outside the desktop shell because they depend on Tauri commands or plugins.

## Build for Production

Create a production desktop build:

```bash
npm run tauri build
```

Tauri writes release artifacts under:

```text
src-tauri/target/release/bundle/
```

## Viewing These Docs

The docs are a standalone Docsify site located in the `docs/` folder.

Recommended preview command:

```bash
npx docsify-cli serve docs
```

Then open:

```text
http://localhost:3000
```

Alternative static server:

```bash
npx serve docs
```

Docsify loads Markdown files in the browser, so editing a `.md` file and refreshing the browser is usually enough.
