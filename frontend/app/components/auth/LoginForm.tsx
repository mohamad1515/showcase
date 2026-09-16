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

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

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
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const user = await login(email, password);

      notifySuccess(`خوش آمدید${user?.name ? `، ${user.name}` : ""}!`);

      router.push(user?.role === "ADMIN" ? "/admin" : "/");
    } catch (err: unknown) {
      notifyError(errorMessage(err, "ورود ناموفق بود."));
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "h-[52px] w-full rounded-xl border bg-background text-sm transition-all duration-200 placeholder:text-muted/50 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      dir="rtl"
      className="flex w-full max-w-[520px]  flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
    >
      {/* Header */}
      <div className="mb-8 sm:mb-9">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            ورود به حساب
          </h2>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <FiLogIn size={21} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          برای ادامه، اطلاعات حساب کاربری خودت رو وارد کن
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-2.5 block text-sm font-bold text-foreground"
          >
            ایمیل
          </label>

          <div className="relative">
            <FiMail
              size={19}
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);

                if (touched.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                  }));
                }
              }}
              onBlur={() => handleBlur("email")}
              placeholder="name@example.com"
              dir="ltr"
              autoComplete="email"
              disabled={busy}
              className={`${inputBase} pl-4 pr-11 text-left ${
                touched.email && errors.email
                  ? "border-[var(--danger)] ring-[var(--danger)]/10"
                  : "border-border focus:border-[var(--brand)] focus:ring-[var(--brand)]/10"
              }`}
            />
          </div>

          {touched.email && errors.email && (
            <p className="mt-2 text-xs font-medium text-[var(--danger)]">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <label
              htmlFor="login-password"
              className="text-sm font-bold text-foreground"
            >
              رمز عبور
            </label>

            <Link
              href="/"
              className="text-xs font-bold text-[var(--brand)] transition-colors hover:text-[var(--brand-hover)]"
            >
              فراموشی رمز عبور
            </Link>
          </div>

          <div className="relative">
            <FiLock
              size={19}
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);

                if (touched.password) {
                  setErrors((prev) => ({
                    ...prev,
                    password: undefined,
                  }));
                }
              }}
              onBlur={() => handleBlur("password")}
              placeholder="رمز عبور خود را وارد کنید"
              dir="ltr"
              autoComplete="current-password"
              disabled={busy}
              className={`${inputBase} pl-12 pr-11 text-left ${
                touched.password && errors.password
                  ? "border-[var(--danger)] ring-[var(--danger)]/10"
                  : "border-border focus:border-[var(--brand)] focus:ring-[var(--brand)]/10"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={busy}
              aria-label={
                showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
              }
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed"
            >
              {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
          </div>

          {touched.password && errors.password && (
            <p className="mt-2 text-xs font-medium text-[var(--danger)]">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember */}
        <label className="flex cursor-pointer select-none items-center gap-3">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRememberMe(e.target.checked)
            }
            disabled={busy}
            className="h-4 w-4 cursor-pointer rounded border-border accent-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
          />

          <span className="text-sm text-muted">مرا به خاطر بسپار</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-[var(--brand)] font-black text-white transition-colors duration-200 hover:bg-[var(--brand-hover)] active:bg-[var(--accent-pressed)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              در حال ورود...
            </>
          ) : (
            <>
              <FiLogIn
                size={18}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
              ورود به حساب
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 border-t border-border pt-6 sm:mt-9 sm:pt-7">
        <p className="text-center text-sm text-muted">
          حساب کاربری ندارید؟{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={busy}
            className="font-black text-[var(--brand)] transition-colors hover:text-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            همین حالا ثبت‌نام کنید
          </button>
        </p>
      </div>

      {/* Security */}
      <p className="mt-5 text-center text-[11px] leading-5 text-muted/50">
        اطلاعات شما با امنیت کامل محافظت می‌شود.
      </p>
    </div>
  );
}
