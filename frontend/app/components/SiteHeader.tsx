"use client";

import Link from "next/link";
import HeaderActions, { navItems, socialLinks } from "./HeaderActions";
import SearchBox from "./SearchBox";

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex-shrink-0 text-base font-black tracking-tight text-foreground whitespace-nowrap sm:text-lg"
          >
            فیت مکمل
          </Link>

          <div className="hidden flex-1 items-center justify-center sm:flex">
            <div className="w-full max-w-xl">
              <SearchBox />
            </div>
          </div>

          <div className="ml-auto flex items-center">
            <HeaderActions />
          </div>
        </div>

        <div className="flex h-12 items-center justify-between gap-3 border-t border-border">
          <nav
            className="hidden items-center justify-end gap-1 md:flex"
            aria-label="منوی اصلی"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-md px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mr-auto flex items-center gap-2 sm:gap-3">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Icon size={16} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
