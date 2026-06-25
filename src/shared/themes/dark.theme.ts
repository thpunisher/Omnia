import { OmniaTheme } from "./theme.types";

export const darkTheme: OmniaTheme = {
  id: "dark",
  name: "Dark",
  description: "The default dark theme. Near-black surfaces with an indigo accent.",
  mode: "dark",
  author: "Omnia",
  version: "1.0.0",

  colors: {
    base:    "#0f0f0f",
    surface: "#161616",
    overlay: "#1e1e1e",
    border:  "#2a2a2a",
    muted:   "#3a3a3a",

    textPrimary:   "#e8e8e8",
    textSecondary: "#8a8a8a",
    textTertiary:  "#5a5a5a",

    accent:     "#5E6AD2",
    accentHover:"#6e7ae0",
    accentDim:  "rgba(94,106,210,0.12)",

    success: "#4ade80",
    warning: "#fb923c",
    danger:  "#f87171",
  },

  typography: {
    fontSans: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    baseFontSize: 15,
    lineHeight: 1.5,
  },

  radii: {
    sm: "4px",
    md: "6px",
    lg: "10px",
    xl: "14px",
  },
};
