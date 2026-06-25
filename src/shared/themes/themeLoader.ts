import { OmniaTheme } from "./theme.types";
import { darkTheme } from "./dark.theme";
import { lightTheme } from "./light.theme";

// ─── Registry ─────────────────────────────────────────────────────────────────
// Built-in themes. Future: load contributor themes from the file system here
// by calling a Tauri command that reads ~/.omnia/themes/*.json, validates
// them against the OmniaTheme schema, and returns the parsed objects.
const BUILTIN_THEMES: OmniaTheme[] = [darkTheme, lightTheme];

let _extraThemes: OmniaTheme[] = [];

export const themeRegistry = {
  all: (): OmniaTheme[] => [...BUILTIN_THEMES, ..._extraThemes],

  get: (id: string): OmniaTheme => {
    return themeRegistry.all().find((t) => t.id === id) ?? darkTheme;
  },

  /** Register a contributor theme at runtime. Future: called by the plugin loader. */
  register: (theme: OmniaTheme): void => {
    if (!theme.id || !theme.name || !theme.colors) {
      console.warn("[themes] Skipping invalid theme:", theme);
      return;
    }
    _extraThemes = _extraThemes.filter((t) => t.id !== theme.id);
    _extraThemes.push(theme);
  },
};

// ─── CSS variable applicator ──────────────────────────────────────────────────
/**
 * Applies a theme by writing its values as CSS custom properties on <html>.
 * Every component in the app reads --color-*, --radius-*, --font-* variables,
 * so swapping a theme is instant with no React re-render required.
 *
 * The mapping here MUST stay in sync with globals.css's @theme block.
 * When you add a new token to OmniaTheme, add it here AND in globals.css.
 */
export function applyTheme(theme: OmniaTheme): void {
  const root = document.documentElement;
  const { colors: c, typography: t, radii: r } = theme;

  // Mode attribute (used by some CSS selectors and the OS-level color-scheme)
  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-mode", theme.mode);
  root.style.colorScheme = theme.mode;

  // Colors
  const colorMap: Record<string, string> = {
    "--color-base":           c.base,
    "--color-surface":        c.surface,
    "--color-overlay":        c.overlay,
    "--color-border":         c.border,
    "--color-muted":          c.muted,
    "--color-popover":        c.overlay,
    "--color-popover-foreground": c.textPrimary,
    "--color-text-primary":   c.textPrimary,
    "--color-text-secondary": c.textSecondary,
    "--color-text-tertiary":  c.textTertiary,
    "--color-accent":         c.accent,
    "--color-accent-hover":   c.accentHover,
    "--color-accent-dim":     c.accentDim,
    "--color-success":        c.success,
    "--color-warning":        c.warning,
    "--color-danger":         c.danger,

    // Zinc compat aliases (used by some Tailwind utility classes throughout the app)
    "--color-zinc-950": c.base,
    "--color-zinc-900": c.surface,
    "--color-zinc-800": c.border,
    "--color-zinc-700": c.muted,
    "--color-zinc-600": c.textTertiary,
    "--color-zinc-500": c.textSecondary,
    "--color-zinc-400": c.textPrimary,
    "--color-zinc-300": c.textPrimary,
    "--color-zinc-200": c.textPrimary,
    "--color-blue-600": c.accent,
  };

  for (const [k, v] of Object.entries(colorMap)) {
    root.style.setProperty(k, v);
  }

  // Typography
  root.style.setProperty("--font-sans", t.fontSans);
  root.style.setProperty("--font-mono", t.fontMono);
  root.style.setProperty("--font-size-base", `${t.baseFontSize}px`);
  root.style.setProperty("--line-height-base", String(t.lineHeight));
  root.style.fontSize = `${t.baseFontSize}px`;
  (root.style as any).fontFamily = t.fontSans;

  // Radii
  root.style.setProperty("--radius-sm", r.sm);
  root.style.setProperty("--radius-md", r.md);
  root.style.setProperty("--radius-lg", r.lg);
  root.style.setProperty("--radius-xl", r.xl);
}

export function applyThemeById(id: string): void {
  applyTheme(themeRegistry.get(id));
}
