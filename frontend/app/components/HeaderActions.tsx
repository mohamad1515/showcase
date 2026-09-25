'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FiChevronLeft,
  FiLogOut,
  FiMenu,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { SiInstagram, SiTelegram } from 'react-icons/si';
import { getCart, removeCartItem, updateCartItem } from '../lib/graphql';
import type { Cart } from '../lib/products';
import { errorMessage, notifyError, notifySuccess } from '../lib/toast';
import { useAuth } from '../providers/AuthProvider';
import SearchBox from './SearchBox';

export const navItems = [
  { href: '/', label: 'صفحه اصلی' },
  { href: '/products', label: 'محصولات' },
  { href: '/#articles', label: 'مقالات' },
  { href: '/#about', label: 'درباره ما' },
  { href: '/#contact', label: 'تماس با ما' },
];

export const socialLinks = [
  {
    href: 'https://t.me/fitmokamel',
    label: 'تلگرام',
    icon: SiTelegram,
  },
  {
    href: 'https://instagram.com/fitmokamel',
    label: 'اینستاگرام',
    icon: SiInstagram,
  },
];

const actionClass =
  'inline-flex h-8 items-center justify-center border border-border bg-surface px-3 text-xs font-bold text-foreground transition-colors hover:border-accent hover:text-accent';

const emptyCart: Cart = { id: '0', items: [], total: '0', itemCount: 0 };

export default function HeaderActions() {
  const { user, token, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isSignedIn = Boolean(token);

  useEffect(() => {
    if (!token) {
      setCart(emptyCart);
      return;
    }

    const refreshCart = async () => {
      try {
        const nextCart = await getCart();
        setCart(nextCart ?? emptyCart);
      } catch {
        setCart(emptyCart);
      }
    };

    refreshCart();
    const handleCartRefresh = () => refreshCart();
    window.addEventListener('cart:refresh', handleCartRefresh);
    return () => window.removeEventListener('cart:refresh', handleCartRefresh);
  }, [token]);

  const handleDisabledCart = () => {
    notifyError('برای مشاهده سبد خرید ابتدا وارد حساب کاربری خود شوید');
  };

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
      notifySuccess('محصول از سبد خرید حذف شد.');
    } catch (err) {
      notifyError(errorMessage(err, 'حذف محصول ناموفق بود.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Cart Icon */}
      {isSignedIn ? (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          title="سبد خرید"
          aria-label="سبد خرید"
          className="text-foreground hover:border-accent hover:text-accent relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          <FiShoppingCart aria-hidden />
          {cart.itemCount > 0 && (
            <span className="bg-accent absolute -top-1 -left-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-none font-black text-white">
              {cart.itemCount}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleDisabledCart}
          title="سبد خرید"
          aria-label="سبد خرید"
          className="text-muted inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full opacity-50 transition-colors"
        >
          <FiShoppingCart aria-hidden />
        </button>
      )}

      {/* Profile / Login-Register */}
      {!loading && (
        <>
          {isSignedIn ? (
            <>
              <Link
                href="/admin"
                title={user?.name || 'پروفایل'}
                className="text-foreground hover:border-accent hover:text-accent inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors"
              >
                <FiUser aria-hidden />
              </Link>

              <button
                type="button"
                onClick={logout}
                title="خروج"
                aria-label="خروج"
                className="text-foreground inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:border-red-500 hover:text-red-500"
              >
                <FiLogOut aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth?mode=login"
                className="border-accent bg-accent hover:bg-accent-strong hover:border-accent-strong hidden h-9 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-bold text-white shadow-sm transition-all duration-200 active:scale-[0.97] sm:inline-flex"
              >
                ورود / عضویت
              </Link>
            </>
          )}
        </>
      )}

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="border-border bg-surface text-foreground inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
      >
        {open ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="border-border bg-surface absolute inset-x-3 top-12 z-50 border p-2 shadow-[0_4px_16px_rgba(0,0,0,.3)] md:hidden">
          {/* Mobile Search */}
          <div className="border-border mb-2 border-b pb-2">
            <SearchBox />
          </div>

          {/* Mobile Nav Items */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-border text-foreground hover:bg-surface-3 flex h-10 items-center border-b px-3 text-sm last:border-0"
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Auth Section */}
          <div className="mt-2 flex gap-2">
            {!loading &&
              (isSignedIn ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className="border-border hover:bg-surface-3 flex h-9 flex-1 items-center justify-center rounded-md border text-sm"
                  >
                    سفارش‌ها
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="bg-danger hover:bg-danger/90 h-9 flex-1 rounded-md text-sm font-bold text-white"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth?mode=login"
                    onClick={() => setOpen(false)}
                    className="border-border hover:bg-surface-3 flex h-9 flex-1 items-center justify-center rounded-md border text-sm"
                  >
                    ورود
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    onClick={() => setOpen(false)}
                    className="flex h-9 flex-1 items-center justify-center bg-[var(--brand)] text-sm font-bold text-white hover:bg-[var(--brand-hover)]"
                  >
                    عضویت
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px]">
          <div className="border-border bg-background absolute top-0 left-0 flex h-full w-full max-w-md flex-col border-l shadow-2xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b p-4">
              <h2 className="text-foreground text-lg font-black">سبد خرید</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="border-border text-foreground hover:border-accent hover:text-accent inline-flex h-9 w-9 items-center justify-center rounded-md border transition"
                aria-label="بستن سبد خرید"
              >
                <FiX aria-hidden />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.items.length === 0 ? (
                <div className="border-border bg-surface flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                  <FiShoppingCart className="text-accent text-3xl" aria-hidden />
                  <p className="text-muted mt-3 text-sm font-bold">سبد خرید شما خالی است.</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-border bg-surface flex gap-3 rounded-lg border p-3"
                  >
                    <div className="bg-background relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                      <img
                        src={item.product.images?.[0] ?? '/images/product.png'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-foreground line-clamp-2 text-sm font-bold">
                          {item.product.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-danger transition hover:text-red-500"
                          aria-label="حذف محصول"
                        >
                          <FiTrash2 aria-hidden />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, item.quantity + 1)}
                            disabled={busyId === item.id}
                            className="border-border bg-background text-foreground hover:border-accent hover:text-accent grid h-8 w-8 place-items-center rounded-md border transition disabled:opacity-60"
                          >
                            <FiPlus aria-hidden />
                          </button>
                          <span className="text-foreground grid min-w-8 place-items-center text-sm font-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, item.quantity - 1)}
                            disabled={busyId === item.id}
                            className="border-border bg-background text-foreground hover:border-accent hover:text-accent grid h-8 w-8 place-items-center rounded-md border transition disabled:opacity-60"
                          >
                            <FiMinus aria-hidden />
                          </button>
                        </div>

                        <span className="text-gold text-sm font-black">{item.lineTotal} تومان</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-border border-t p-4">
              <div className="text-muted mb-3 flex items-center justify-between text-sm font-bold">
                <span>جمع کل</span>
                <span className="text-gold text-lg font-black">{cart.total} تومان</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="bg-accent hover:bg-accent-strong inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-black text-white transition"
                >
                  مشاهده سبد خرید
                </Link>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="border-border bg-background text-foreground hover:border-accent hover:text-accent inline-flex h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-black transition"
                >
                  ادامه خرید
                  <FiChevronLeft aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
