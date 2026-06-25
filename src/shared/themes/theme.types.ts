/**
 * Omnia Theme Schema v1
 *
 * A theme is a JSON object that maps to CSS custom properties applied at
 * the :root level. Contributors can publish custom themes by exporting an
 * object that satisfies this interface.
 *
 * Future plugin API note: themes will be loadable from a JSON file in the
 * user's themes directory (~/.omnia/themes/<id>.json). The loader validates
 * the object against this schema before applying it, so malformed themes
 * fail loudly rather than silently corrupting the UI.
 */
export interface OmniaTheme {
  /** Unique machine-readable ID used in DB and URL params. */
  id: string;
  /** Display name shown in the theme picker. */
  name: string;
  /** Brief description shown beneath the name in settings. */
  description: string;
  /** "dark" | "light" — used to set prefers-color-scheme meta and prose inversion. */
  mode: "dark" | "light";
  /** Author info — shown in a future theme marketplace. */
  author?: string;
  /** Semantic version of this theme file. */
  version?: string;

  colors: ThemeColors;
  typography: ThemeTypography;
  radii: ThemeRadii;
}

export interface ThemeColors {
  /** Page background — the lowest layer. */
  base: string;
  /** Card/sidebar surface — one step above base. */
  surface: string;
  /** Dropdown/popover/overlay — one step above surface. */
  overlay: string;
  /** Default border color. */
  border: string;
  /** Muted element color (disabled states, placeholders). */
  muted: string;

  /** Primary text. */
  textPrimary: string;
  /** Secondary text — labels, subtitles. */
  textSecondary: string;
  /** Tertiary text — hints, placeholders, timestamps. */
  textTertiary: string;

  /**
   * Single accent color — used for links, active states, primary buttons.
   * Keep this restrained; it's the *one* color that defines the theme's personality.
   */
  accent: string;
  /** Hover/active variant of the accent. ~10% lighter/darker. */
  accentHover: string;
  /** Very low-opacity accent for backgrounds (chip tints, highlights). */
  accentDim: string;

  /** Semantic status colors */
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeTypography {
  /**
   * Font stack for body text.
   * Example: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
   */
  fontSans: string;
  /**
   * Font stack for code/monospace.
   * Example: "JetBrains Mono, ui-monospace, Menlo, monospace"
   */
  fontMono: string;
  /** Base font size in px. Default: 15 */
  baseFontSize: number;
  /** Body line height. Default: 1.5 */
  lineHeight: number;
}

export interface ThemeRadii {
  /** Tiny: tags, checkboxes. Default: 4px */
  sm: string;
  /** Default: input fields, small cards. Default: 6px */
  md: string;
  /** Medium: modals, medium cards. Default: 10px */
  lg: string;
  /** Large: full-screen cards, overlays. Default: 14px */
  xl: string;
}
