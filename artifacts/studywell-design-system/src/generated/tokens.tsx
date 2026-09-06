/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f6f1e8",
      "foreground": "#1f3c3e",
      "card": "#fbf8f0",
      "cardForeground": "#1f3c3e",
      "popover": "#fbf8f0",
      "popoverForeground": "#1f3c3e",
      "primary": "#28575a",
      "primaryForeground": "#fbf8f0",
      "secondary": "#eee8db",
      "secondaryForeground": "#1f3c3e",
      "muted": "#eee9dd",
      "mutedForeground": "#687b7c",
      "accent": "#e3b537",
      "accentForeground": "#1f3c3e",
      "destructive": "#cc674e",
      "destructiveForeground": "#fbf8f0",
      "border": "#ded7c9",
      "input": "#ded7c9",
      "ring": "#e3b537",
      "chart1": "#d96a4b",
      "chart2": "#e4a83d",
      "chart3": "#4e9b8d",
      "chart4": "#6f7bb9",
      "chart5": "#cf7f9e",
      "sidebar": "#28575a",
      "sidebarForeground": "#fbf8f0",
      "sidebarBorder": "#3f6b6d",
      "sidebarPrimary": "#e3b537",
      "sidebarPrimaryForeground": "#1f3c3e",
      "sidebarAccent": "#386366",
      "sidebarAccentForeground": "#fbf8f0",
      "sidebarRing": "#e3b537"
    },
    "dark": {
      "background": "#173337",
      "foreground": "#f8f4e9",
      "card": "#1f3f42",
      "cardForeground": "#f8f4e9",
      "popover": "#1f3f42",
      "popoverForeground": "#f8f4e9",
      "primary": "#e3b537",
      "primaryForeground": "#1f3c3e",
      "secondary": "#2d4d51",
      "secondaryForeground": "#f8f4e9",
      "muted": "#29474a",
      "mutedForeground": "#c8c0ad",
      "accent": "#cc674e",
      "accentForeground": "#f8f4e9",
      "destructive": "#cc674e",
      "destructiveForeground": "#f8f4e9",
      "border": "#335559",
      "input": "#335559",
      "ring": "#e3b537",
      "chart1": "#f08c70",
      "chart2": "#f2c05d",
      "chart3": "#75b9a9",
      "chart4": "#9da7e0",
      "chart5": "#e8a1bc",
      "sidebar": "#122a2c",
      "sidebarForeground": "#f8f4e9",
      "sidebarBorder": "#29474a",
      "sidebarPrimary": "#e3b537",
      "sidebarPrimaryForeground": "#1f3c3e",
      "sidebarAccent": "#1d3b3e",
      "sidebarAccentForeground": "#f8f4e9",
      "sidebarRing": "#e3b537"
    }
  },
  "fontFamily": {
    "sans": [
      "DM Sans",
      "sans-serif"
    ],
    "serif": [
      "Fraunces",
      "serif"
    ],
    "mono": [
      "IBM Plex Mono",
      "monospace"
    ]
  },
  "radius": "0.85rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
