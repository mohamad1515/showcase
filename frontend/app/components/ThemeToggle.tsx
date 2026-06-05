"use client";

import { useEffect, useState } from "react";

const themes = {
  light: { label: "روز", icon: "☀" },
  dark: { label: "شب", icon: "◐" },
} as const;

type ThemeKey = keyof typeof themes;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeKey>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem("site-theme") as ThemeKey | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeTheme = savedTheme ?? (systemPrefersDark ? "dark" : "light");
    setTheme(activeTheme);
    document.documentElement.classList.toggle("dark", activeTheme === "dark");
    document.documentElement.style.colorScheme = activeTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeKey = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("site-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-accent hover:bg-accent/10"
      aria-label="تغییر تم سایت"
    >
      <span className="text-base" aria-hidden="true">
        {themes[theme].icon}
      </span>
      <span>{mounted ? themes[theme].label : "..."}</span>
    </button>
  );
}
