"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiPackage } from "react-icons/fi";
import { getOrders } from "../lib/graphql";
import type { Order } from "../lib/products";
import { errorMessage, notifyError } from "../lib/toast";
import { useAuth } from "../providers/AuthProvider";

const statusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  shipped: "ارسال‌شده",
  canceled: "لغوشده",
};

export default function OrdersPage() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }

    getOrders()
      .then(setOrders)
      .catch((err) =>
        notifyError(errorMessage(err, "دریافت سفارش‌ها ناموفق بود.")),
      )
      .finally(() => setLoading(false));
  }, [authLoading, token]);

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="rounded-lg border border-border bg-surface p-8 text-sm font-bold text-muted">
          در حال بارگذاری سفارش‌ها...
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <FiPackage className="mx-auto text-4xl text-accent" aria-hidden />
          <h1 className="mt-4 text-2xl font-black text-foreground">
            سفارش‌های من
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            برای مشاهده تاریخچه سفارش‌ها ابتدا وارد حساب کاربری شوید.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
          >
            ورود به حساب
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="mb-8 border-b border-border pb-6">
        <p className="text-sm font-bold text-accent">سفارش‌ها</p>
        <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          تاریخچه سفارش‌های من
        </h1>
      </section>

      {orders.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-muted">هنوز سفارشی ثبت نشده است.</p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
          >
            مشاهده محصولات
          </Link>
        </section>
      ) : (
        <section className="grid gap-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    سفارش شماره {order.id}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-muted">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm font-black">
                  <span className="rounded-md bg-accent/10 px-3 py-1 text-accent">
                    {statusLabels[order.status] ?? order.status}
                  </span>
                  <span className="text-gold">{order.total} تومان</span>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background px-4 py-3 text-sm"
                  >
                    <span className="font-bold text-foreground">
                      {item.productName}
                    </span>
                    <span className="font-bold text-muted">
                      {item.quantity} × {item.unitPrice} تومان
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
