'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import type { Cart } from '../lib/products';
import { getCart, removeCartItem, updateCartItem } from '../lib/graphql';
import { errorMessage, notifyError, notifyInfo } from '../lib/toast';
import { useAuth } from '../providers/AuthProvider';

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
      .catch((err) => notifyError(errorMessage(err, 'دریافت سبد خرید ناموفق بود.')))
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
      window.dispatchEvent(new CustomEvent('cart:refresh'));
    } catch (err) {
      notifyError(errorMessage(err, 'به‌روزرسانی سبد خرید ناموفق بود.'));
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(itemId: string) {
    setBusyId(itemId);
    try {
      const nextCart = await removeCartItem(itemId);
      setCart(nextCart);
      window.dispatchEvent(new CustomEvent('cart:refresh'));
    } catch (err) {
      notifyError(errorMessage(err, 'حذف محصول ناموفق بود.'));
    } finally {
      setBusyId(null);
    }
  }

  async function checkout() {
    setCheckoutLoading(true);
    try {
      notifyInfo('درگاه پرداخت هنوز فعال نیست؛ سفارشی ثبت نشد.');
    } catch {
      notifyInfo('درگاه پرداخت هنوز فعال نیست؛ سفارشی ثبت نشد.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="border-border bg-surface text-muted rounded-lg border p-8 text-sm font-bold">
          در حال بارگذاری سبد خرید...
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="border-border bg-surface rounded-lg border p-8 text-center shadow-sm">
          <FiShoppingBag className="text-accent mx-auto text-4xl" aria-hidden />
          <h1 className="text-foreground mt-4 text-2xl font-black">سبد خرید</h1>
          <p className="text-muted mt-3 text-sm leading-7">
            برای مشاهده و مدیریت سبد خرید ابتدا وارد حساب کاربری شوید.
          </p>
          <Link
            href="/auth/login"
            className="bg-accent hover:bg-accent-strong mt-6 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-black text-white transition"
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
      <section className="border-border mb-8 border-b pb-6">
        <p className="text-accent text-sm font-bold">سبد خرید</p>
        <h1 className="text-foreground mt-3 text-3xl font-black sm:text-4xl">
          مرور محصولات انتخاب‌شده
        </h1>
      </section>

      {isEmpty ? (
        <section className="border-border bg-surface rounded-lg border p-8 text-center shadow-sm">
          <p className="text-muted text-sm font-bold">سبد خرید شما خالی است.</p>
          <Link
            href="/products"
            className="bg-accent hover:bg-accent-strong mt-5 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-black text-white transition"
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
                className="border-border bg-card grid gap-4 rounded-lg border p-4 shadow-sm sm:grid-cols-[120px_1fr] sm:items-center"
              >
                <div className="bg-background relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={item.product.images?.[0] ?? '/images/product.png'}
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
                      className="text-foreground hover:text-accent text-base font-black transition"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-muted mt-3 flex items-center gap-2 text-xs font-bold">
                      <span>تعداد: {item.quantity}</span>
                      <span>•</span>
                      <span>{item.product.weight}</span>
                    </div>
                    <p className="text-gold mt-3 text-sm font-bold">{item.lineTotal} تومان</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity + 1)}
                      disabled={busyId === item.id}
                      className="border-border bg-surface text-foreground hover:border-accent hover:text-accent grid h-10 w-10 place-items-center rounded-md border transition disabled:opacity-60"
                      title="افزایش تعداد"
                    >
                      <FiPlus aria-hidden />
                    </button>
                    <span className="bg-background text-foreground grid h-10 min-w-12 place-items-center rounded-md px-3 text-sm font-black">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity - 1)}
                      disabled={busyId === item.id}
                      className="border-border bg-surface text-foreground hover:border-accent hover:text-accent grid h-10 w-10 place-items-center rounded-md border transition disabled:opacity-60"
                      title="کاهش تعداد"
                    >
                      <FiMinus aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={busyId === item.id}
                      className="border-border bg-surface text-danger hover:border-danger grid h-10 w-10 place-items-center rounded-md border transition disabled:opacity-60"
                      title="حذف"
                    >
                      <FiTrash2 aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="border-border bg-surface h-fit rounded-lg border p-6 shadow-sm">
            <h2 className="text-foreground text-xl font-black">فاکتور</h2>
            <div className="border-border mt-5 grid gap-3 border-t pt-5 text-sm font-bold">
              <div className="text-muted flex items-center justify-between">
                <span>تعداد آیتم‌ها</span>
                <span>{cart.itemCount}</span>
              </div>
              <div className="text-muted flex items-center justify-between">
                <span>جمع مبالغ</span>
                <span>{cart.total} تومان</span>
              </div>
              <div className="border-border text-foreground flex items-center justify-between border-t pt-3">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-gold text-lg font-black">{cart.total} تومان</span>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={checkout}
                disabled={checkoutLoading}
                className="bg-accent hover:bg-accent-strong inline-flex h-12 w-full items-center justify-center rounded-md px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? 'در حال ثبت سفارش' : 'ثبت سفارش'}
              </button>
              <Link
                href="/"
                className="border-border bg-background text-foreground hover:border-accent hover:text-accent inline-flex h-12 w-full items-center justify-center rounded-md border px-5 text-sm font-black transition"
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
