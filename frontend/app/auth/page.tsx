"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/app/components/auth/AuthLayout";
import AuthVisual from "@/app/components/auth/AuthVisual";
import LoginForm from "@/app/components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

type AuthMode = "login" | "register";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") as AuthMode | null;
  const [mode, setMode] = useState<AuthMode>("login");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle mode from URL
  useEffect(() => {
    if (modeParam && (modeParam === "login" || modeParam === "register")) {
      setMode(modeParam);
    }
  }, [modeParam]);

  const handleModeChange = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <AuthLayout>
      <div className="relative w-full">
        {/* Desktop: Animated Container */}
        <div className="hidden overflow-hidden lg:block">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform:
                mode === "login" ? "translateX(0)" : "translateX(-100%)",
              direction: "ltr",
            }}
          >
            {/* Login Section */}
            <div className="w-full flex-shrink-0">
              <div className="flex h-full min-h-96 flex-row gap-0">
                {/* Visual Section - Login */}
                <div className="flex w-1/2 items-center justify-center">
                  <div
                    className="w-full px-8 py-12 transition-all duration-500"
                    style={{
                      opacity: mode === "login" && !isTransitioning ? 1 : 0.3,
                      transform:
                        mode === "login" && !isTransitioning
                          ? "scale(1)"
                          : "scale(0.9)",
                    }}
                  >
                    <AuthVisual mode="login" />
                  </div>
                </div>

                {/* Form Section - Login */}
                <div className="flex w-1/2 items-center">
                  <LoginForm
                    onSwitchToRegister={() => handleModeChange("register")}
                  />
                </div>
              </div>
            </div>

            {/* Register Section */}
            <div className="w-full flex-shrink-0">
              <div className="flex h-full min-h-96 flex-row-reverse gap-0">
                {/* Visual Section - Register */}
                <div className="flex w-1/2 items-center justify-center">
                  <div
                    className="w-full px-8 py-12 transition-all duration-500"
                    style={{
                      opacity:
                        mode === "register" && !isTransitioning ? 1 : 0.3,
                      transform:
                        mode === "register" && !isTransitioning
                          ? "scale(1)"
                          : "scale(0.9)",
                    }}
                  >
                    <AuthVisual mode="register" />
                  </div>
                </div>

                {/* Form Section - Register */}
                <div className="flex w-1/2 items-center">
                  <RegisterForm
                    onSwitchToLogin={() => handleModeChange("login")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className="space-y-6 lg:hidden">
          <div
            className="transition-all duration-500"
            style={{
              opacity: !isTransitioning ? 1 : 0,
            }}
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
      </div>
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
