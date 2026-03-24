"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SimpleThemeContextValue = {
  isSimple: boolean;
  toggle: () => void;
};

const SimpleThemeContext = createContext<SimpleThemeContextValue>({
  isSimple: false,
  toggle: () => {},
});

const STORAGE_KEY = "calcpath_simple_theme";

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
  const [isSimple, setIsSimple] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setIsSimple(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    if (isSimple) {
      document.documentElement.setAttribute("data-simple-theme", "true");
    } else {
      document.documentElement.removeAttribute("data-simple-theme");
    }
  }, [isSimple]);

  const toggle = useCallback(() => {
    setIsSimple((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ isSimple, toggle }), [isSimple, toggle]);

  return (
    <SimpleThemeContext.Provider value={value}>
      {children}
    </SimpleThemeContext.Provider>
  );
}

export const useSimpleTheme = () => useContext(SimpleThemeContext);
