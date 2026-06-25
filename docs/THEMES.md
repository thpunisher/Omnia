# Building a Custom Theme for Omnia

Themes in Omnia are JSON objects that implement the `OmniaTheme` interface. They map directly to CSS custom properties applied at the `:root` level — no compilation step required.

## Theme schema

```typescript
interface OmniaTheme {
  id: string;           // unique, lowercase, hyphenated: "my-theme"
  name: string;         // Display name: "My Theme"
  description: string;  // Short description
  mode: "dark" | "light";
  author?: string;
  version?: string;     // semver: "1.0.0"

  colors: {
    base: string;            // Page background
    surface: string;         // Cards, sidebar
    overlay: string;         // Dropdowns, popovers
    border: string;          // Dividers, input borders
    muted: string;           // Disabled states

    textPrimary: string;     // Main text
    textSecondary: string;   // Labels, subtitles
    textTertiary: string;    // Hints, timestamps

    accent: string;          // Links, buttons, active states
    accentHover: string;     // Hover variant of accent
    accentDim: string;       // Low-opacity accent for backgrounds

    success: string;
    warning: string;
    danger: string;
  };

  typography: {
    fontSans: string;       // Body font stack
    fontMono: string;       // Code font stack
    baseFontSize: number;   // In px, e.g. 15
    lineHeight: number;     // e.g. 1.5
  };

  radii: {
    sm: string;   // "4px"
    md: string;   // "6px"
    lg: string;   // "10px"
    xl: string;   // "14px"
  };
}
```

## Creating your theme

1. Copy `src/shared/themes/dark.theme.ts` and rename it `<your-id>.theme.ts`
2. Change `id`, `name`, `description`, `mode`, and `author`
3. Adjust colors — the most important ones are `base`, `surface`, `accent`, and the three `text*` values
4. Export your theme object

## Registering it

In `src/shared/themes/themeLoader.ts`, add your theme to `BUILTIN_THEMES`:

```typescript
import { myTheme } from "./my-theme.theme";

const BUILTIN_THEMES: OmniaTheme[] = [darkTheme, lightTheme, myTheme];
```

## Testing your theme

```bash
npm run tauri dev
```

Go to **Settings → Appearance** and your theme will appear in the picker.

## Submitting your theme

Open a PR with:
- Your theme file in `src/shared/themes/`
- The registration in `themeLoader.ts`
- A screenshot in your PR description
- The tag `theme` on the PR

Accepted themes become built-in and appear in the theme picker for all users.

## Color tips

- **Contrast is critical.** `textPrimary` on `base` should pass WCAG AA (4.5:1 ratio)
- **One accent color** — resist adding multiple. The accent is used for buttons, links, active states, and checkboxes simultaneously
- **`accentDim`** should be a very low-opacity version of your accent: `rgba(R,G,B,0.10–0.15)`
- Tools: [Coolors](https://coolors.co), [Realtime Colors](https://www.realtimecolors.com), [OKLCH Picker](https://oklch.com)
