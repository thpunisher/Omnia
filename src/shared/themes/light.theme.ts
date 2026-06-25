import { OmniaTheme } from "./theme.types";

export const lightTheme: OmniaTheme = {
  id: "light",
  name: "Light",
  description: "A clean light theme with warm whites and subtle grey surfaces.",
  mode: "light",
  author: "Omnia",
  version: "1.0.0",

  colors: {
    base:    "#fafafa",
    surface: "#ffffff",
    overlay: "#f5f5f5",
    border:  "#e5e5e5",
    muted:   "#d4d4d4",

    textPrimary:   "#111111",
    textSecondary: "#555555",
    textTertiary:  "#999999",

    accent:     "#5E6AD2",
    accentHover:"#4a56c8",
    accentDim:  "rgba(94,106,210,0.10)",

    success: "#16a34a",
    warning: "#ea580c",
    danger:  "#dc2626",
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
