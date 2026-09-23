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
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات' },
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
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:border-accent hover:text-accent cursor-pointer"
        >
          <FiShoppingCart aria-hidden />
          {cart.itemCount > 0 && (
            <span className="absolute -left-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-black leading-none text-white">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted opacity-50 cursor-not-allowed transition-colors cursor-pointer"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:border-accent hover:text-accent cursor-pointer"
              >
                <FiUser aria-hidden />
              </Link>

              <button
                type="button"
                onClick={logout}
                title="خروج"
                aria-label="خروج"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:border-red-500 hover:text-red-500 cursor-pointer"
              >
                <FiLogOut aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth?mode=login"
                className="
    hidden sm:inline-flex
    h-9 items-center justify-center
    rounded-md
    border border-accent
    bg-accent
    px-4
    text-sm font-bold
    text-white
    shadow-sm
    transition-all duration-200
    hover:bg-accent-strong
    hover:border-accent-strong
    active:scale-[0.97]
    cursor-pointer
  "
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground md:hidden"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
      >
        {open ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute inset-x-3 top-12 z-50 border border-border bg-surface p-2 shadow-[0_4px_16px_rgba(0,0,0,.3)] md:hidden">
          {/* Mobile Search */}
          <div className="mb-2 pb-2 border-b border-border">
            <SearchBox />
          </div>

          {/* Mobile Nav Items */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex h-10 items-center border-b border-border px-3 text-sm text-foreground last:border-0 hover:bg-surface-3"
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
                    className="flex h-9 flex-1 items-center justify-center rounded-md border border-border text-sm hover:bg-surface-3"
                  >
                    سفارش‌ها
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="h-9 flex-1 rounded-md bg-danger text-sm font-bold text-white hover:bg-danger/90"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth?mode=login"
                    onClick={() => setOpen(false)}
                    className="flex h-9 flex-1 items-center justify-center rounded-md border border-border text-sm hover:bg-surface-3"
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
          <div className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-black text-foreground">سبد خرید</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition hover:border-accent hover:text-accent"
                aria-label="بستن سبد خرید"
              >
                <FiX aria-hidden />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface p-6 text-center">
                  <FiShoppingCart className="text-3xl text-accent" aria-hidden />
                  <p className="mt-3 text-sm font-bold text-muted">سبد خرید شما خالی است.</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-border bg-surface p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-background">
                      <img
                        src={item.product.images?.[0] ?? '/images/product.png'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 text-sm font-bold text-foreground">
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
                            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-foreground transition hover:border-accent hover:text-accent disabled:opacity-60"
                          >
                            <FiPlus aria-hidden />
                          </button>
                          <span className="grid min-w-8 place-items-center text-sm font-black text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, item.quantity - 1)}
                            disabled={busyId === item.id}
                            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-foreground transition hover:border-accent hover:text-accent disabled:opacity-60"
                          >
                            <FiMinus aria-hidden />
                          </button>
                        </div>

                        <span className="text-sm font-black text-gold">{item.lineTotal} تومان</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between text-sm font-bold text-muted">
                <span>جمع کل</span>
                <span className="text-lg font-black text-gold">{cart.total} تومان</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-black text-white transition hover:bg-accent-strong"
                >
                  مشاهده سبد خرید
                </Link>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
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
