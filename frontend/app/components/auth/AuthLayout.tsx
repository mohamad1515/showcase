"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        {children}
      </div>
    </main>
  );
}
