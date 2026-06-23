import { useSyncExternalStore } from "react";

import {
  THEME_STORAGE_KEY,
  THEMES,
  type Theme,
} from "../constants/preferences";

function subscribeToTheme(callback: () => void) {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-theme-mode"],
  });

  return () => observer.disconnect();
}

function getTheme(): Theme {
  if (typeof document === "undefined") {
    return THEMES.LIGHT;
  }

  return document.documentElement.dataset.theme === THEMES.DARK
    ? THEMES.DARK
    : THEMES.LIGHT;
}

export function persistTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeMode = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyPersistedTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);

  if (saved === THEMES.DARK || saved === THEMES.LIGHT) {
    persistTheme(saved);
    return;
  }

  persistTheme(getTheme());
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    () => THEMES.LIGHT,
  );

  const toggleTheme = () => {
    const next = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    persistTheme(next);
  };

  return {
    theme,
    isDark: theme === THEMES.DARK,
    toggleTheme,
  };
}
