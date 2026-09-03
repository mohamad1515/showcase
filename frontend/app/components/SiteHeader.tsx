"use client";

import Link from "next/link";
import HeaderActions from "./HeaderActions";

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 h-10 border-b border-border bg-background"
      dir="rtl"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo on the right */}
        <Link
          href="/"
          className="flex-shrink-0 text-sm font-bold tracking-tight text-foreground whitespace-nowrap"
        >
          فیت مکمل
        </Link>

        {/* Header Actions on the left */}
        <HeaderActions />
      </div>
    </header>
  );
}
