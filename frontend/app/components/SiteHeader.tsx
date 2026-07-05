"use client";

import Link from "next/link";
import HeaderActions from "./HeaderActions";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-foreground"
        >
          فیت مکمل
        </Link>
        <HeaderActions />
      </div>
    </header>
  );
}
