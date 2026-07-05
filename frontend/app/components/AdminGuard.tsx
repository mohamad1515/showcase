"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { useAuth } from "../providers/AuthProvider";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("/auth/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/unauthorized");
      }
    }
  }, [loading, router, token, user]);

  if (loading || !token || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center justify-center px-5 py-10">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center text-sm font-bold text-muted shadow-sm">
          <FiLoader className="animate-spin text-accent" aria-hidden />
          در حال بررسی دسترسی شما...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
