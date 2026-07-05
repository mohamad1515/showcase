"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiLock, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import { login, signup } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    try {
      await signup({ name, email, password });
      const session = await login({ email, password });
      setSession(session.token, session.user || null);
      notifySuccess("حساب شما با موفقیت ساخته شد.");
      router.push("/");
    } catch (err: unknown) {
      notifyError(errorMessage(err, "ثبت‌نام ناموفق بود."));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
      <section className="space-y-5">
        <p className="h-eyebrow">عضویت اعضا</p>
        <h1 className="h-display max-w-xl text-3xl text-foreground sm:text-5xl">
          حساب بسازید و مستقیم وارد پنل مدیریت شوید.
        </h1>
        <p className="max-w-lg text-sm leading-8 text-muted">
          این فرم به mutation ثبت‌نام بک‌اند وصل است و بعد از ساخت حساب، نشست
          ورود را به‌طور خودکار برقرار می‌کند.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">ایجاد حساب</h2>
            <p className="mt-2 text-sm text-muted">
              اطلاعات عضو جدید را وارد کنید.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="rounded-md border border-border px-4 py-2 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
          >
            ورود
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-foreground">نام کامل</span>
            <div className="relative mt-2">
              <FiUser
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                required
                className="h-12 w-full rounded-md border border-border bg-background pl-4 pr-11 text-sm text-foreground outline-none transition focus:border-accent"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-foreground">ایمیل</span>
            <div className="relative mt-2">
              <FiMail
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                type="email"
                dir="ltr"
                required
                className="h-12 w-full rounded-md border border-border bg-background pl-4 pr-11 text-left text-sm text-foreground outline-none transition focus:border-accent"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-foreground">رمز عبور</span>
            <div className="relative mt-2">
              <FiLock
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                type="password"
                dir="ltr"
                minLength={6}
                required
                className="h-12 w-full rounded-md border border-border bg-background pl-4 pr-11 text-left text-sm text-foreground outline-none transition focus:border-accent"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? (
              "در حال ساخت حساب..."
            ) : (
              <>
                <FiUserPlus aria-hidden />
                ثبت‌نام و ورود
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
