"use client";

import React, { useEffect, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import {
  createCategory,
  getCategories,
  removeCategory,
  updateCategory,
} from "../../lib/graphql";
import type { Category } from "../../lib/products";

const emptyForm = {
  slug: "",
  name: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "دریافت دسته‌بندی‌ها ناموفق بود.",
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
    setEditingSlug(null);
    setNotice(null);
    setError(null);
  }

  function startEdit(category: Category) {
    setForm({
      slug: category.slug,
      name: category.name,
      description: category.description,
    });
    setEditingSlug(category.slug);
    setNotice(null);
    setError(null);
  }

  async function refreshCategories() {
    const data = await getCategories();
    setCategories(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (editingSlug) {
        await updateCategory(editingSlug, {
          slug: form.slug,
          name: form.name,
          description: form.description,
        });
        setNotice("دسته‌بندی با موفقیت ویرایش شد.");
      } else {
        await createCategory({
          slug: form.slug,
          name: form.name,
          description: form.description,
        });
        setNotice("دسته‌بندی جدید اضافه شد.");
      }
      await refreshCategories();
      resetForm();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "ذخیره دسته‌بندی ناموفق بود.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    const confirmed = window.confirm("این دسته‌بندی حذف شود؟");
    if (!confirmed) return;
    setError(null);
    setNotice(null);
    try {
      await removeCategory(slug);
      await refreshCategories();
      setNotice("دسته‌بندی حذف شد.");
      if (editingSlug === slug) resetForm();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "حذف دسته‌بندی ناموفق بود.",
      );
    }
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-accent">دسته‌بندی‌ها</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
              مدیریت دسته‌بندی‌ها
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              دسته‌بندی جدید بسازید یا دسته‌بندی‌های فعلی را تغییر دهید. دو
              دسته‌بندی پیش‌فرض نیز در سیستم قرار داده شده است.
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
                  افزودن یا ویرایش دسته‌بندی
                </h2>
                <p className="mt-2 text-sm text-muted">
                  نام و اسلاگ دسته‌بندی را وارد کنید.
                </p>
              </div>
              {editingSlug && (
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
                  نام دسته‌بندی
                </span>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  className="admin-input"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">اسلاگ</span>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                  className="admin-input text-left"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  توضیحات
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="admin-textarea"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 h-12 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? "در حال ذخیره..."
                  : editingSlug
                    ? "ویرایش دسته‌بندی"
                    : "افزودن دسته‌بندی"}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-foreground">
                لیست دسته‌بندی‌ها
              </h2>
              <p className="mt-2 text-sm text-muted">
                برای مشاهده یا حذف هر دسته‌بندی روی دکمه‌های روبرو کلیک کنید.
              </p>
            </div>
            {loading ? (
              <p className="rounded-md border border-border bg-background p-5 text-sm font-bold text-muted">
                در حال دریافت دسته‌بندی‌ها...
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <article
                    key={category.slug}
                    className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-black text-foreground">
                          {category.name}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {category.description || "بدون توضیح"}
                        </p>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                          {category.slug}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.slug)}
                          className="h-10 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100"
                        >
                          حذف
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
