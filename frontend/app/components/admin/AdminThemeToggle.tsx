'use client';

import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

type AdminTheme = 'light' | 'dark';

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<AdminTheme>('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('admin-theme');
    const activeTheme = savedTheme === 'dark' ? 'dark' : 'light';
    setTheme(activeTheme);
    document.querySelector('.admin-theme')?.setAttribute('data-theme', activeTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('admin-theme', nextTheme);
    document.querySelector('.admin-theme')?.setAttribute('data-theme', nextTheme);
  }

  const Icon = theme === 'dark' ? FiSun : FiMoon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="border-border bg-surface-1 text-foreground hover:bg-surface-3 inline-flex h-10 w-10 items-center justify-center rounded-md border transition"
      aria-label={theme === 'dark' ? 'فعال‌کردن تم روز' : 'فعال‌کردن تم شب'}
      title={theme === 'dark' ? 'تم روز' : 'تم شب'}
    >
      <Icon aria-hidden />
    </button>
  );
}
