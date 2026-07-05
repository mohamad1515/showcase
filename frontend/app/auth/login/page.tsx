"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const user = await login(email, password);
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود.");
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
      <section className="space-y-5">
        <p className="text-sm font-black text-accent">ورود اعضا</p>
        <h1 className="max-w-xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
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
              placeholder="رمز عبور"
              type="password"
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
            disabled={loading}
            className="h-12 w-full rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "در حال ورود..." : "ورود به پنل"}
          </button>
        </form>
      </section>
    </main>
  );
}
