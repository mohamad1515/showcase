"use client";

import React, { useEffect, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import {
  createSlider,
  getSliders,
  removeSlider,
  updateSlider,
} from "../../lib/graphql";
import type { Slider } from "../../lib/products";

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  link: "/products",
};

export default function AdminSlidersPage() {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSliders()
      .then((data) => {
        if (active) setSlides(data);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "دریافت اسلایدرها ناموفق بود.",
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

  function startEdit(slide: Slider) {
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      link: slide.link,
    });
    setEditingId(Number(slide.id));
    setNotice(null);
    setError(null);
  }

  async function refreshSlides() {
    const data = await getSliders();
    setSlides(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (editingId) {
        await updateSlider(editingId.toString(), {
          title: form.title,
          subtitle: form.subtitle,
          image: form.image,
          link: form.link,
        });
        setNotice("اسلاید با موفقیت به‌روزرسانی شد.");
      } else {
        await createSlider({
          title: form.title,
          subtitle: form.subtitle,
          image: form.image,
          link: form.link,
        });
        setNotice("اسلاید جدید اضافه شد.");
      }
      await refreshSlides();
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ذخیره اسلاید ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (slides.length <= 1) {
      setError("حداقل یک اسلاید باید باقی بماند.");
      return;
    }
    const confirmed = window.confirm("این اسلاید حذف شود؟");
    if (!confirmed) return;
    setError(null);
    setNotice(null);
    try {
      await removeSlider(id.toString());
      await refreshSlides();
      setNotice("اسلاید حذف شد.");
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حذف اسلاید ناموفق بود.");
    }
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-accent">اسلایدر</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
              مدیریت اسلایدها
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              اسلایدهای صفحه اول را به صورت تصویری و متنی مدیریت کنید. در صورت
              داشتن بیش از یک اسلاید، حرکت خودکار هر ۳۰ ثانیه فعال خواهد شد.
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
                  افزودن یا ویرایش اسلاید
                </h2>
                <p className="mt-2 text-sm text-muted">
                  تیتر، توضیح و تصویر اسلاید را تنظیم کنید.
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
                <span className="text-sm font-bold text-foreground">تیتر</span>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  className="admin-input"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  توضیح کوتاه
                </span>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  rows={3}
                  required
                  className="admin-textarea"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">
                  آدرس تصویر
                </span>
                <input
                  value={form.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  required
                  className="admin-input"
                  placeholder="مثال: /images/slider/slider-2.jpg"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">لینک</span>
                <input
                  value={form.link}
                  onChange={(e) => updateField("link", e.target.value)}
                  className="admin-input"
                  placeholder="/products"
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
                    ? "ویرایش اسلاید"
                    : "افزودن اسلاید"}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-foreground">
                لیست اسلایدها
              </h2>
              <p className="mt-2 text-sm text-muted">
                حداقل یک اسلاید باید در سیستم فعال بماند.
              </p>
            </div>
            {loading ? (
              <p className="rounded-md border border-border bg-background p-5 text-sm font-bold text-muted">
                در حال دریافت اسلایدها...
              </p>
            ) : (
              <div className="space-y-3">
                {slides.map((slide) => (
                  <article
                    key={slide.id}
                    className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-black text-foreground">
                          {slide.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {slide.subtitle}
                        </p>
                        <p className="mt-3 text-xs text-muted">
                          لینک: {slide.link}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(slide)}
                          className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          disabled={slides.length <= 1}
                          onClick={() => handleDelete(Number(slide.id))}
                          className="h-10 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
