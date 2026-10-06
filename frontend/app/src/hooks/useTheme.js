import { useState, useEffect, useCallback } from "react";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("bookverse-theme");
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {
    // fallback to light
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  const applyTheme = useCallback((currentTheme) => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.body.setAttribute("data-theme", currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.body.classList.remove("dark-theme");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const handleThemeChange = () => {
      const stored = localStorage.getItem("bookverse-theme") || "light";
      setTheme(stored);
      applyTheme(stored);
    };

    window.addEventListener("bookverse-theme-change", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("bookverse-theme-change", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("bookverse-theme", next);
      } catch {
        // ignore storage errors
      }
      window.dispatchEvent(new Event("bookverse-theme-change"));
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };
}
