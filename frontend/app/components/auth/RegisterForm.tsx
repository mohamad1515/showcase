"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from "react-icons/fi";
import { login, signup } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { setSession, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false,
  });

  const busy = loading || submitting;

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!name.trim()) {
      newErrors.name = "نام الزامی است";
    } else if (name.trim().length < 2) {
      newErrors.name = "نام باید حداقل ۲ کاراکتر باشد";
    }

    if (!email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "ایمیل معتبر نیست";
    }

    if (!password) {
      newErrors.password = "رمز عبور الزامی است";
    } else if (password.length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = "رمز عبور باید شامل حروف و اعداد باشد";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "تکرار رمز عبور الزامی است";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "رمز عبور و تکرار آن برابر نیستند";
    }

    if (!termsAccepted) {
      newErrors.terms = "باید قوانین و شرایط را بپذیرید";
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
      await signup({ name, email, password });
      const session = await login({ email, password });
      setSession(session.token, session.user || null);
      notifySuccess("حساب شما با موفقیت ساخته شد.");
      router.push("/");
    } catch (err: unknown) {
      notifyError(errorMessage(err, "ثبت‌نام ناموفق بود."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-[620px] w-full max-w-[520px] flex-col justify-center rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 md:p-10 lg:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground max-sm:text-2xl md:text-4xl">
          ایجاد حساب کاربری
        </h1>
        <p className="mt-2 text-xs text-muted sm:text-sm md:text-base">
          برای شروع مسیر تمرینی خود، یک حساب جدید بسازید.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-5">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-bold text-foreground"
          >
            نام و نام خانوادگی
          </label>
          <div className="relative mt-2">
            <FiUser
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
              size={18}
            />
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (touched.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              onBlur={() => handleBlur("name")}
              placeholder="نام و نام خانوادگی"
              disabled={busy}
              className={`h-11 w-full rounded-md border bg-background pl-3 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                touched.name && errors.name
                  ? "border-[var(--danger)] ring-1 ring-[var(--danger)]"
                  : "border-border focus:border-accent focus:ring-[var(--accent)]"
              }`}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-xs text-[var(--danger)]">{errors.name}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
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
              id="register-email"
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

        <div>
          <label
            htmlFor="register-password"
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
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (touched.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onBlur={() => handleBlur("password")}
              placeholder="حداقل ۶ کاراکتر (حروف و اعداد)"
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

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-bold text-foreground"
          >
            تکرار رمز عبور
          </label>
          <div className="relative mt-2">
            <FiLock
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
              size={18}
            />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(e.target.value);
                if (touched.confirmPassword)
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
              }}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="رمز عبور را دوباره وارد کنید"
              dir="ltr"
              disabled={busy}
              className={`h-11 w-full rounded-md border bg-background pl-10 pr-10 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                touched.confirmPassword && errors.confirmPassword
                  ? "border-[var(--danger)] ring-1 ring-[var(--danger)]"
                  : "border-border focus:border-accent focus:ring-[var(--accent)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={busy}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground disabled:cursor-not-allowed"
              aria-label={
                showConfirmPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
              }
            >
              {showConfirmPassword ? (
                <FiEye size={18} />
              ) : (
                <FiEyeOff size={18} />
              )}
            </button>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setTermsAccepted(e.target.checked);
                if (touched.terms)
                  setErrors((prev) => ({ ...prev, terms: undefined }));
              }}
              onBlur={() => handleBlur("terms")}
              disabled={busy}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border transition accent-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="text-sm text-muted">
              <span className="text-foreground">
                قوانین و شرایط استفاده را می‌پذیرم
              </span>
              {" و "}
              <Link
                href="/terms"
                className="text-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                سیاست حفاظت از اطلاعات
              </Link>
            </span>
          </label>
          {touched.terms && errors.terms && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.terms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[var(--brand)] to-[var(--brand-hover)] font-black text-white transition hover:shadow-lg hover:shadow-[var(--brand)]/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              در حال ایجاد حساب...
            </>
          ) : (
            <>
              <FiUserPlus aria-hidden />
              ایجاد حساب
            </>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-center text-sm text-muted">
          قبلاً حساب ساخته‌اید؟{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[var(--brand)] transition hover:text-[var(--brand-hover)]"
          >
            وارد شوید
          </button>
        </p>
      </div>
    </div>
  );
}
