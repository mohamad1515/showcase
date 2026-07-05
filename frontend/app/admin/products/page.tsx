"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import {
  createProduct,
  getProducts,
  removeProduct,
  updateProduct,
} from "../../lib/graphql";
import type {
  Product,
  ProductCategory,
  ProductInput,
} from "../../lib/products";
import { useAuth } from "../../providers/AuthProvider";

const emptyForm: ProductInput = {
  slug: "",
  name: "",
  tagline: "",
  summary: "",
  description: "",
  features: [],
  category: "default",
  price: "",
  weight: "",
  quantity: "1",
  images: [],
};

const categories: { value: ProductCategory; label: string }[] = [
  { value: "default", label: "پیشنهادی" },
  { value: "popular", label: "محبوب" },
  { value: "best-selling", label: "پرفروش" },
];

function productToForm(product: Product): ProductInput {
  return {
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    summary: product.summary,
    description: product.description,
    features: product.features,
    category: product.category,
    price: product.price,
    weight: product.weight,
    quantity: product.quantity,
    images: product.images ?? [],
  };
}

function featuresToText(features: string[]) {
  return features.join("\n");
}

function textToFeatures(value: string) {
  return value
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function imagesToText(images: string[]) {
  return images.join("\n");
}

function textToImages(value: string) {
  return value
    .split("\n")
    .map((image) => image.trim())
    .filter(Boolean);
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [featuresText, setFeaturesText] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isEditing = Boolean(editingSlug);

  const stats = useMemo(
    () => ({
      total: products.length,
      popular: products.filter((item) => item.category === "popular").length,
      bestSelling: products.filter((item) => item.category === "best-selling")
        .length,
    }),
    [products],
  );

  useEffect(() => {
    if (!authLoading && !token) router.replace("/auth/login");
  }, [authLoading, router, token]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    setLoading(true);
    getProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "دریافت محصولات ناموفق بود.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function updateField<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setFeaturesText("");
    setImagesText("");
    setEditingSlug(null);
  }

  function startEdit(product: Product) {
    setForm(productToForm(product));
    setFeaturesText(featuresToText(product.features));
    setImagesText(imagesToText(product.images));
    setEditingSlug(product.slug);
    setNotice(null);
    setError(null);
  }

  async function refreshProducts() {
    const items = await getProducts();
    setProducts(items);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      ...form,
      slug: form.slug.trim(),
      features: textToFeatures(featuresText),
      images: textToImages(imagesText),
    };

    try {
      if (editingSlug) {
        await updateProduct(editingSlug, payload);
        setNotice("محصول با موفقیت ویرایش شد.");
      } else {
        await createProduct(payload);
        setNotice("محصول جدید اضافه شد.");
      }

      await refreshProducts();
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ذخیره محصول ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(product: Product) {
    const approved = window.confirm(`محصول «${product.name}» حذف شود؟`);
    if (!approved) return;

    setError(null);
    setNotice(null);

    try {
      await removeProduct(product.slug);
      await refreshProducts();
      if (editingSlug === product.slug) resetForm();
      setNotice("محصول حذف شد.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حذف محصول ناموفق بود.");
    }
  }

  if (authLoading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm font-bold text-muted">
          در حال بررسی وضعیت ورود...
        </div>
      </main>
    );
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-accent">پنل ادمین</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
              مدیریت محصولات
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
              محصولات را از همین صفحه به سرویس GraphQL بک‌اند اضافه، ویرایش یا
              حذف کنید.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
          >
            مشاهده سایت
          </Link>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-bold text-muted">کل محصولات</p>
            <p className="mt-2 text-3xl font-black text-foreground">
              {stats.total}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-bold text-muted">محبوب</p>
            <p className="mt-2 text-3xl font-black text-foreground">
              {stats.popular}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-bold text-muted">پرفروش</p>
            <p className="mt-2 text-3xl font-black text-foreground">
              {stats.bestSelling}
            </p>
          </div>
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
                  {isEditing ? "ویرایش محصول" : "محصول جدید"}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  هر ویژگی را در یک خط جدا وارد کنید.
                </p>
              </div>
              {isEditing && (
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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="نام محصول">
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    className="admin-input"
                  />
                </Field>
                <Field label="اسلاگ">
                  <input
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    required
                    dir="ltr"
                    className="admin-input text-left"
                  />
                </Field>
              </div>

              <Field label="تیتر کوتاه">
                <input
                  value={form.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  required
                  className="admin-input"
                />
              </Field>

              <Field label="خلاصه">
                <textarea
                  value={form.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  required
                  rows={3}
                  className="admin-textarea"
                />
              </Field>

              <Field label="توضیحات کامل">
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  rows={5}
                  className="admin-textarea"
                />
              </Field>

              <Field label="ویژگی‌ها">
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  required
                  rows={4}
                  className="admin-textarea"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="دسته‌بندی">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      updateField("category", e.target.value as ProductCategory)
                    }
                    className="admin-input"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="قیمت">
                  <input
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    required
                    className="admin-input"
                  />
                </Field>
                <Field label="وزن">
                  <input
                    value={form.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    required
                    className="admin-input"
                  />
                </Field>
                <Field label="تعداد">
                  <input
                    value={form.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                    required
                    className="admin-input"
                  />
                </Field>
              </div>

              <Field label="آدرس تصاویر (هر خط یک آدرس)">
                <textarea
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                  placeholder="/images/product.png"
                />
              </Field>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 h-12 rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? "در حال ذخیره..."
                  : isEditing
                    ? "ذخیره تغییرات"
                    : "افزودن محصول"}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-foreground">
                لیست محصولات
              </h2>
              <p className="mt-2 text-sm text-muted">
                برای تغییر هر محصول، گزینه ویرایش را انتخاب کنید.
              </p>
            </div>

            {loading ? (
              <p className="rounded-md border border-border bg-background p-5 text-sm font-bold text-muted">
                در حال دریافت محصولات...
              </p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <article
                    key={product.slug}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-black text-foreground">
                          {product.name}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {product.tagline}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded bg-accent/10 px-2 py-1 text-accent">
                            {
                              categories.find(
                                (item) => item.value === product.category,
                              )?.label
                            }
                          </span>
                          <span className="rounded bg-surface px-2 py-1 text-muted">
                            {product.price} تومان
                          </span>
                          <span className="rounded bg-surface px-2 py-1 text-muted">
                            وزن: {product.weight}
                          </span>
                          <span className="rounded bg-surface px-2 py-1 text-muted">
                            تعداد: {product.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(product)}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
