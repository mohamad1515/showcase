"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-4 sm:py-4 lg:px-4 lg:py-4">
        {children}
      </div>
    </main>
  );
}
