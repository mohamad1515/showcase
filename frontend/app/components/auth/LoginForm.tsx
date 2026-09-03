"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { useAuth } from "../../providers/AuthProvider";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const busy = loading || submitting;

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "ایمیل معتبر نیست";
    }

    if (!password) {
      newErrors.password = "رمز عبور الزامی است";
    } else if (password.length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const user = await login(email, password);
      notifySuccess(`خوش آمدید${user?.name ? "، " + user.name : ""}!`);
      router.push(user?.role === "ADMIN" ? "/admin" : "/");
    } catch (err: unknown) {
      notifyError(errorMessage(err, "ورود ناموفق بود."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-[620px] w-full max-w-[520px] flex-col justify-center rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 md:p-10 lg:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground max-sm:text-2xl md:text-4xl">
          ورود به حساب
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted md:text-base">
          اطلاعات حساب خود را وارد کنید و دوباره شروع کنید.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-bold text-foreground"
          >
            ایمیل
          </label>
          <div className="relative mt-2">
            <FiMail
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
              size={18}
            />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (touched.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onBlur={() => handleBlur("email")}
              placeholder="name@example.com"
              dir="ltr"
              disabled={busy}
              className={`h-11 w-full rounded-md border bg-background pl-3 pr-10 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                touched.email && errors.email
                  ? "border-[var(--danger)] ring-1 ring-[var(--danger)]"
                  : "border-border focus:border-accent focus:ring-[var(--accent)]"
              }`}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-bold text-foreground"
          >
            رمز عبور
          </label>
          <div className="relative mt-2">
            <FiLock
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
              size={18}
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (touched.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onBlur={() => handleBlur("password")}
              placeholder="رمز عبور را وارد کنید"
              dir="ltr"
              disabled={busy}
              className={`h-11 w-full rounded-md border bg-background pl-10 pr-10 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                touched.password && errors.password
                  ? "border-[var(--danger)] ring-1 ring-[var(--danger)]"
                  : "border-border focus:border-accent focus:ring-[var(--accent)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={busy}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground disabled:cursor-not-allowed"
              aria-label={
                showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
              }
            >
              {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRememberMe(e.target.checked)
              }
              disabled={busy}
              className="h-4 w-4 cursor-pointer rounded border-border transition accent-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="text-sm text-muted">مرا به خاطر بسپار</span>
          </label>
          <Link
            href="/"
            className="text-xs font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
          >
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={busy}
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[var(--brand)] to-[var(--brand-hover)] font-black text-white transition hover:shadow-lg hover:shadow-[var(--brand)]/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              در حال ورود...
            </>
          ) : (
            <>
              <FiLogIn aria-hidden />
              ورود به حساب
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-center text-sm text-muted">
          حساب کاربری ندارید؟{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[var(--brand)] transition hover:text-[var(--brand-hover)]"
          >
            ثبت‌نام کنید
          </button>
        </p>
      </div>
    </div>
  );
}
