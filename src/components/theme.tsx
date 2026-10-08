"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { site, type ThemeName } from "@/src/config/site";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  /** Flip between clay and night (the desk lamp switch). */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Holds the active theme and mirrors it to <html data-theme> so CSS tokens follow. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(site.theme.default);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "night" ? "clay" : "night")), []);
  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}
