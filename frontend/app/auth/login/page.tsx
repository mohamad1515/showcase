"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiArrowLeft, FiLock, FiLogIn, FiMail } from "react-icons/fi";
import { useAuth } from "../../providers/AuthProvider";
import { errorMessage, notifyError, notifySuccess } from "../../lib/toast";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  const busy = loading || submitting;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
      <section className="space-y-5">
        <p className="h-eyebrow">ورود اعضا</p>
        <h1 className="h-display max-w-xl text-3xl text-foreground sm:text-5xl">
          مدیریت محصولات را از یک پنل تمیز و سریع انجام بده.
        </h1>
        <p className="max-w-lg text-sm leading-8 text-muted">
          بعد از ورود، به بخش ادمین منتقل می‌شوید و می‌توانید محصولات را اضافه،
          ویرایش یا حذف کنید.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">ورود</h2>
            <p className="mt-2 text-sm text-muted">
              اطلاعات حساب خود را وارد کنید.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="rounded-md border border-border px-4 py-2 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
          >
            عضویت
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="رمز عبور"
                type="password"
                dir="ltr"
                required
                className="h-12 w-full rounded-md border border-border bg-background pl-4 pr-11 text-left text-sm text-foreground outline-none transition focus:border-accent"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? (
              "در حال ورود..."
            ) : (
              <>
                <FiLogIn aria-hidden />
                ورود به پنل
              </>
            )}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-xs font-bold text-muted transition hover:text-accent"
          >
            بازگشت به صفحه اصلی
            <FiArrowLeft aria-hidden />
          </Link>
        </form>
      </section>
    </main>
  );
}
