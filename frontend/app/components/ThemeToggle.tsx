"use client";

import { useEffect, useState } from "react";

const themes = {
  light: { label: "روز", mark: "☀" },
  dark: { label: "شب", mark: "🌙" },
} as const;

type ThemeKey = keyof typeof themes;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeKey>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem(
      "site-theme",
    ) as ThemeKey | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
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
      className="text-foreground hover:border-accent hover:text-accent inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-base transition-colors"
      aria-label="تغییر تم سایت"
      title={mounted ? themes[theme].label : "تم"}
    >
      {mounted ? themes[theme].mark : "..."}
    </button>
  );
}
