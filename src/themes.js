// Hex values without the leading '#'. `light` and `dark` are a matched pair and
// are what the prefers-color-scheme snippet in the README uses.
export const THEMES = {
  light: {
    title: "1a7f5a",
    accent: "41b883",
    text: "24292f",
    bg: "ffffff",
    border: "e3e8ee",
    tileBg: "fcfdfe",
    tileBorder: "eaeef3",
  },
  dark: {
    title: "41b883",
    accent: "41b883",
    text: "c9d1d9",
    bg: "0d1117",
    border: "262c34",
    tileBg: "12181f",
    tileBorder: "222932",
  },
  vue: {
    title: "41b883",
    accent: "41b883",
    text: "273849",
    bg: "fffefe",
    border: "e4e2e2",
  },
  default: {
    title: "2f80ed",
    accent: "4c71f2",
    text: "434d58",
    bg: "fffefe",
    border: "e4e2e2",
  },
  radical: {
    title: "fe428e",
    accent: "f8d847",
    text: "a9fef7",
    bg: "141321",
    border: "2a2438",
  },
  tokyonight: {
    title: "70a5fd",
    accent: "bf91f3",
    text: "a9b1d6",
    bg: "1a1b27",
    border: "2a2e45",
  },
  dracula: {
    title: "ff6e96",
    accent: "79dafa",
    text: "f8f8f2",
    bg: "282a36",
    border: "3d4051",
  },
};

export function resolveTheme(name) {
  const theme = THEMES[name];
  if (!theme) {
    console.warn(`Unknown theme "${name}", using "light".`);
    return THEMES.light;
  }
  return theme;
}
