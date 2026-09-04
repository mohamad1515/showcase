"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import AuthLayout from "@/app/components/auth/AuthLayout";
import AuthVisual from "@/app/components/auth/AuthVisual";
import LoginForm from "@/app/components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type AuthMode = "login" | "register";

function AuthPageContent() {
  const searchParams = useSearchParams();

  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<AuthMode>(
    modeParam === "register" ? "register" : "login",
  );

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (modeParam === "login" || modeParam === "register") {
      setMode(modeParam);
    }
  }, [modeParam]);

  const handleModeChange = (newMode: AuthMode) => {
    if (newMode === mode || isTransitioning) return;

    setIsTransitioning(true);

    window.setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);

      window.history.replaceState(null, "", `/auth?mode=${newMode}`);
    }, 250);
  };

  return (
    <AuthLayout>
      <main
        dir="rtl"
        className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8"
      >
        <Link
          href="/"
          className="flex items-center justify-self-end gap-2 w-40 text-sm font-bold text-muted transition-colors hover:text-foreground p-2 border border-border rounded-lg bg-surface shadow-sm shadow-black/5 mb-0 lg:mb-2"
        >
          بازگشت به فروشگاه
          <FiArrowLeft size={16} />
        </Link>
        {/* ================= Desktop ================= */}
        <div className="hidden overflow-hidden rounded-lg border border-border/60 bg-surface shadow-2xl shadow-black/5 lg:block">
          <div className="grid min-h-[680px] grid-cols-2">
            {/* Visual */}
            <div className="p-0">
              <div
                className={`h-full transition-all duration-300 ${
                  isTransitioning
                    ? "scale-[0.98] opacity-70"
                    : "scale-100 opacity-100"
                }`}
              >
                <AuthVisual mode={mode} />
              </div>
            </div>

            {/* Form */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ${
                isTransitioning
                  ? "translate-y-1 opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
            >
              {mode === "login" ? (
                <LoginForm
                  onSwitchToRegister={() => handleModeChange("register")}
                />
              ) : (
                <RegisterForm
                  onSwitchToLogin={() => handleModeChange("login")}
                />
              )}
            </div>
          </div>
        </div>

        {/* ================= Mobile ================= */}
        <div className="lg:hidden">
          {/* Visual */}
          <div
            className={`transition-all duration-300 ${
              isTransitioning
                ? "scale-[0.98] opacity-70"
                : "scale-100 opacity-100"
            }`}
          >
            <AuthVisual mode={mode} />
          </div>

          {/* Form */}
          <div
            className={`mt-3 overflow-hidden rounded-lg border border-border/60 bg-surface transition-all duration-300 ${
              isTransitioning
                ? "translate-y-1 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {mode === "login" ? (
              <LoginForm
                onSwitchToRegister={() => handleModeChange("register")}
              />
            ) : (
              <RegisterForm onSwitchToLogin={() => handleModeChange("login")} />
            )}
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
            در حال بارگذاری...
          </div>
        </AuthLayout>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
