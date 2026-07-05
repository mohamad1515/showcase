"use client";

import React, { useEffect, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import {
  createUser,
  getUsers,
  setUserActive,
  updateUser,
} from "../../lib/graphql";
import type { AdminUser } from "../../lib/products";

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "دریافت کاربران ناموفق بود.",
        ),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setNotice(null);
    setError(null);
  }

  function startEdit(user: AdminUser) {
    setForm({ name: user.name, email: user.email, password: "" });
    setEditingId(Number(user.id));
    setNotice(null);
    setError(null);
  }

  async function refreshUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (editingId) {
        await updateUser(editingId.toString(), {
          name: form.name,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
        });
        setNotice("اطلاعات کاربر با موفقیت به‌روز شد.");
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setNotice("کاربر جدید با موفقیت اضافه شد.");
      }
      await refreshUsers();
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ذخیره کاربر ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    setError(null);
    setNotice(null);
    try {
      await setUserActive(user.id.toString(), !user.is_active);
      await refreshUsers();
      setNotice(
        `کاربر ${user.name} ${user.is_active ? "غیرفعال" : "فعال"} شد.`,
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "بروزرسانی وضعیت ناموفق بود.",
      );
    }
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-accent">مدیریت کاربران</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
              کاربران سایت
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              کاربران را مشاهده کنید، حساب جدید بسازید و وضعیت دسترسی آن‌ها را
              فعال یا غیرفعال کنید.
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
          >
            بازگشت به داشبورد
          </a>
        </section>

        {(error || notice) && (
          <div
            className={`mb-6 rounded-md border px-4 py-3 text-sm font-bold ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-foreground">
                  افزودن یا ویرایش کاربر
                </h2>
                <p className="mt-2 text-sm text-muted">
                  نام، ایمیل و رمز عبور را وارد کنید.
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-border px-4 py-2 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
                >
                  انصراف
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  نام کامل
                </span>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  className="admin-input"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">ایمیل</span>
                <input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  type="email"
                  required
                  className="admin-input"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  رمز عبور
                </span>
                <input
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  type="password"
                  className="admin-input"
                  placeholder={
                    editingId ? "فقط در صورت تغییر وارد کنید" : "رمز عبور"
                  }
                  minLength={editingId ? undefined : 6}
                  required={!editingId}
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 h-12 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? "در حال ذخیره..."
                  : editingId
                    ? "به‌روزرسانی کاربر"
                    : "افزودن کاربر جدید"}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-foreground">
                لیست کاربران
              </h2>
              <p className="mt-2 text-sm text-muted">
                برای مشاهده یا تغییر وضعیت کاربران روی ویرایش و فعال/غیرفعال
                کلیک کنید.
              </p>
            </div>
            {loading ? (
              <p className="rounded-md border border-border bg-background p-5 text-sm font-bold text-muted">
                در حال دریافت کاربران...
              </p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-black text-foreground">
                          {user.name}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {user.email}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">
                            {user.role}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 ${user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                          >
                            {user.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
                        >
                          {user.is_active ? "غیرفعال کردن" : "فعال کردن"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminGuard>
  );
}
