"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import type { Cart } from "../lib/products";
import {
  createOrderFromCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../lib/graphql";
import { errorMessage, notifyError, notifyInfo } from "../lib/toast";
import { useAuth } from "../providers/AuthProvider";

export default function CartPage() {
  const { token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }

    getCart()
      .then(setCart)
      .catch((err) =>
        notifyError(errorMessage(err, "دریافت سبد خرید ناموفق بود.")),
      )
      .finally(() => setLoading(false));
  }, [authLoading, token]);

  async function changeQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    setBusyId(itemId);
    try {
      const nextCart = await updateCartItem(itemId, quantity);
      setCart(nextCart);
      window.dispatchEvent(new CustomEvent("cart:refresh"));
    } catch (err) {
      notifyError(errorMessage(err, "به‌روزرسانی سبد خرید ناموفق بود."));
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(itemId: string) {
    setBusyId(itemId);
    try {
      const nextCart = await removeCartItem(itemId);
      setCart(nextCart);
      window.dispatchEvent(new CustomEvent("cart:refresh"));
    } catch (err) {
      notifyError(errorMessage(err, "حذف محصول ناموفق بود."));
    } finally {
      setBusyId(null);
    }
  }

  async function checkout() {
    setCheckoutLoading(true);
    try {
      if (cart && cart.items.length > 0) {
        await createOrderFromCart();
      }
      notifyInfo(
        "این درگاه بانکی موقتا خاموش میباشد لطفا در زمان دیگری تلاش کنید",
      );
    } catch {
      notifyInfo(
        "این درگاه بانکی موقتا خاموش میباشد لطفا در زمان دیگری تلاش کنید",
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="rounded-lg border border-border bg-surface p-8 text-sm font-bold text-muted">
          در حال بارگذاری سبد خرید...
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <FiShoppingBag className="mx-auto text-4xl text-accent" aria-hidden />
          <h1 className="mt-4 text-2xl font-black text-foreground">سبد خرید</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            برای مشاهده و مدیریت سبد خرید ابتدا وارد حساب کاربری شوید.
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

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="mb-8 border-b border-border pb-6">
        <p className="text-sm font-bold text-accent">سبد خرید</p>
        <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          مرور محصولات انتخاب‌شده
        </h1>
      </section>

      {isEmpty ? (
        <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-muted">سبد خرید شما خالی است.</p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
          >
            مشاهده محصولات
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[120px_1fr] sm:items-center"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
                  <Image
                    src={item.product.images?.[0] ?? "/images/product.png"}
                    alt={item.product.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-base font-black text-foreground transition hover:text-accent"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-muted">
                      <span>تعداد: {item.quantity}</span>
                      <span>•</span>
                      <span>{item.product.weight}</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-gold">
                      {item.lineTotal} تومان
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity + 1)}
                      disabled={busyId === item.id}
                      className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-foreground transition hover:border-accent hover:text-accent disabled:opacity-60"
                      title="افزایش تعداد"
                    >
                      <FiPlus aria-hidden />
                    </button>
                    <span className="grid h-10 min-w-12 place-items-center rounded-md bg-background px-3 text-sm font-black text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity - 1)}
                      disabled={busyId === item.id}
                      className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-foreground transition hover:border-accent hover:text-accent disabled:opacity-60"
                      title="کاهش تعداد"
                    >
                      <FiMinus aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={busyId === item.id}
                      className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-danger transition hover:border-danger disabled:opacity-60"
                      title="حذف"
                    >
                      <FiTrash2 aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-black text-foreground">فاکتور</h2>
            <div className="mt-5 grid gap-3 border-t border-border pt-5 text-sm font-bold">
              <div className="flex items-center justify-between text-muted">
                <span>تعداد آیتم‌ها</span>
                <span>{cart.itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>جمع مبالغ</span>
                <span>{cart.total} تومان</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-foreground">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-lg font-black text-gold">
                  {cart.total} تومان
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={checkout}
                disabled={checkoutLoading}
                className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? "در حال ثبت سفارش" : "ثبت سفارش"}
              </button>
              <Link
                href="/"
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
