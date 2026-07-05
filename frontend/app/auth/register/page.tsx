"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { login, signup } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      await signup({ name, email, password });
      const session = await login({ email, password });
      setSession(session.token, session.user || null);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ثبت‌نام ناموفق بود.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
      <section className="space-y-5">
        <p className="text-sm font-black text-accent">عضویت اعضا</p>
        <h1 className="max-w-xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
          حساب بسازید و مستقیم وارد پنل مدیریت شوید.
        </h1>
        <p className="max-w-lg text-sm leading-8 text-muted">
          این فرم به mutation ثبت‌نام بک‌اند وصل است و بعد از ساخت حساب، نشست
          ورود را در مرورگر ذخیره می‌کند.
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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام و نام خانوادگی"
              required
              className="mt-2 h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-foreground">ایمیل</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              required
              className="mt-2 h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-foreground">رمز عبور</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              type="password"
              minLength={6}
              required
              className="mt-2 h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
            />
          </label>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "در حال ساخت حساب..." : "ثبت‌نام و ورود"}
          </button>
        </form>
      </section>
    </main>
  );
}
