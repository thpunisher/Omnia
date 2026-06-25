# Plugin System (Roadmap)

The plugin system is not yet implemented, but the codebase is designed for it. This document describes the planned API so contributors can help build it.

## Planned architecture

```
~/.omnia/
└── plugins/
    └── my-plugin/
        ├── plugin.json    # manifest
        └── index.js       # entry point (sandboxed)
```

### plugin.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "your-username",
  "description": "What this plugin does",
  "permissions": ["tasks:read", "tasks:write", "notes:read"]
}
```

### Available permissions (planned)

| Permission | Access |
|---|---|
| `tasks:read` | Read tasks from the store |
| `tasks:write` | Create/update/delete tasks |
| `notes:read` | Read notes and folders |
| `notes:write` | Create/update/delete notes |
| `goals:read` | Read goals |
| `goals:write` | Update goal progress |
| `ui:sidebar` | Add a sidebar item |
| `ui:toolbar` | Add a note editor toolbar button |

### Plugin entry point

```javascript
// index.js — runs in an isolated iframe sandbox
export default function register(omnia) {
  // omnia.tasks.getAll() — returns Promise<Task[]>
  // omnia.tasks.create({ title, priority }) — returns Promise<Task>
  // omnia.notes.getAll() — returns Promise<Note[]>
  // omnia.ui.addSidebarItem({ icon, label, onClick })
  // omnia.ui.addToolbarButton({ icon, tooltip, onClick })
}
```

## Help build it

If you want to work on the plugin system, see the open issue [#TODO] and leave a comment. The main work is:

1. **Tauri side:** a Rust command to scan `~/.omnia/plugins/`, load `plugin.json`, validate permissions
2. **Frontend side:** a sandboxed iframe per plugin with a `postMessage`-based API bridge
3. **API surface:** a small, stable `omnia.*` object passed to `register()`

The security model is explicit permissions per plugin — no implicit access to anything.
