"use client";

import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthRoute && <SiteHeader />}
      <main className="flex-1">{children}</main>
      {!isAuthRoute && <SiteFooter />}
    </div>
  );
}
