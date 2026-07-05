"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import ThemeToggle from "./ThemeToggle";

export const navItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/#about", label: "درباره ما" },
  { href: "/#contact", label: "تماس با ما" },
];

export default function HeaderActions() {
  const { user, token, loading, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const isSignedIn = Boolean(token);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex items-center gap-4">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-bold text-foreground transition hover:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <ThemeToggle />

      {!loading &&
        (isSignedIn ? (
          <>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
              >
                پنل ادمین
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              title={user?.email || "خروج"}
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-black text-background transition hover:bg-accent"
            >
              خروج
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
            >
              ورود
            </Link>

            <Link
              href="/auth/register"
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-black text-white transition hover:bg-accent-strong"
            >
              عضویت
            </Link>
          </>
        ))}

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-xl font-black text-foreground"
        aria-label="باز کردن منو"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute left-5 right-5 top-[72px] z-50 rounded-lg border border-border bg-surface p-3 shadow-xl md:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-bold text-foreground transition hover:bg-background"
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-bold text-accent transition hover:bg-background"
              >
                پنل ادمین
              </Link>
            )}

            {!loading &&
              (isSignedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-3 text-right text-sm font-bold text-foreground transition hover:bg-background"
                >
                  خروج
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-sm font-bold text-foreground transition hover:bg-background"
                  >
                    ورود
                  </Link>

                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-sm font-bold text-accent transition hover:bg-background"
                  >
                    عضویت
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
