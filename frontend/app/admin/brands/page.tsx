"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import {
  createBrand,
  getBrands,
  removeBrand,
  updateBrand,
} from "../../lib/graphql";
import type { Brand } from "../../lib/products";
import { FiArrowRight, FiEdit, FiTrash2 } from "react-icons/fi";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setBrands(await getBrands());
  }
  useEffect(() => {
    refresh()
      .catch(() => setMessage("دریافت برندها ناموفق بود."))
      .finally(() => setLoading(false));
  }, []);
  function reset() {
    setName("");
    setEditingId(null);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (editingId) await updateBrand(editingId, name);
      else await createBrand(name);
      await refresh();
      reset();
      setMessage("برند با موفقیت ذخیره شد.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "ذخیره برند ناموفق بود.",
      );
    }
  }
  async function remove(id: string) {
    if (!window.confirm("این برند حذف شود؟")) return;
    try {
      await removeBrand(id);
      await refresh();
      if (editingId === id) reset();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حذف برند ناموفق بود.",
      );
    }
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-black text-accent"
          >
            <FiArrowRight aria-hidden /> بازگشت به داشبورد
          </Link>
        </div>
        <section className="mb-8 border-b border-border pb-8">
          <p className="text-sm font-black text-accent">برندها</p>
          <h1 className="mt-3 text-3xl font-black">مدیریت برندها</h1>
        </section>
        {message && (
          <p className="mb-5 rounded-md border border-border bg-surface p-4 text-sm font-bold text-muted">
            {message}
          </p>
        )}
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={submit}
            className="grid gap-4 rounded-lg border border-border bg-surface p-6"
          >
            <label className="grid gap-2 text-sm font-bold">
              نام برند
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="admin-input"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="h-11 flex-1 rounded-md bg-accent px-4 text-sm font-black text-white"
              >
                {editingId ? "ویرایش برند" : "افزودن برند"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="h-11 rounded-md border border-border px-4 text-sm font-black"
                >
                  انصراف
                </button>
              )}
            </div>
          </form>
          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-xl font-black">فهرست برندها</h2>
            {loading ? (
              <p className="text-sm text-muted">در حال دریافت...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between rounded-md border border-border bg-background p-3"
                  >
                    <span className="font-bold">{brand.name}</span>
                    <span className="flex gap-1">
                      <button
                        type="button"
                        title="ویرایش"
                        onClick={() => {
                          setEditingId(brand.id);
                          setName(brand.name);
                        }}
                        className="p-2 text-muted hover:text-accent"
                      >
                        <FiEdit />
                      </button>
                      <button
                        type="button"
                        title="حذف"
                        onClick={() => remove(brand.id)}
                        className="p-2 text-danger"
                      >
                        <FiTrash2 />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminGuard>
  );
}
