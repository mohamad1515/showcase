"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import {
  createFlavor,
  getFlavors,
  removeFlavor,
  updateFlavor,
} from "../../lib/graphql";
import type { Flavor } from "../../lib/products";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function AdminFlavorsPage() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setFlavors(await getFlavors());
  }

  useEffect(() => {
    refresh()
      .catch(() => setMessage("دریافت طعم‌ها ناموفق بود."))
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
      if (editingId) await updateFlavor(editingId, name);
      else await createFlavor(name);
      await refresh();
      reset();
      setMessage("طعم با موفقیت ذخیره شد.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "ذخیره طعم ناموفق بود.",
      );
    }
  }

  async function remove(id: string) {
    if (!window.confirm("این طعم حذف شود؟")) return;
    try {
      await removeFlavor(id);
      await refresh();
      if (editingId === id) reset();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حذف طعم ناموفق بود.",
      );
    }
  }

  return (
    <AdminGuard>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-black text-accent"
        >
          <FiArrowRight aria-hidden /> بازگشت به داشبورد
        </Link>
        <section className="mb-8 border-b border-border pb-8">
          <p className="text-sm font-black text-accent">طعم‌ها</p>
          <h1 className="mt-3 text-3xl font-black text-foreground">
            مدیریت طعم‌ها
          </h1>
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
              نام طعم
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
                {editingId ? "ویرایش طعم" : "افزودن طعم"}
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
            <h2 className="mb-4 text-xl font-black">فهرست طعم‌ها</h2>
            {loading ? (
              <p className="text-sm text-muted">در حال دریافت...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {flavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="flex items-center justify-between rounded-md border border-border bg-background p-3"
                  >
                    <span className="font-bold">{flavor.name}</span>
                    <span className="flex gap-1">
                      <button
                        type="button"
                        title="ویرایش"
                        onClick={() => {
                          setEditingId(flavor.id);
                          setName(flavor.name);
                        }}
                        className="p-2 text-muted hover:text-accent"
                      >
                        <FiEdit />
                      </button>
                      <button
                        type="button"
                        title="حذف"
                        onClick={() => remove(flavor.id)}
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
