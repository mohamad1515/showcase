'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiBox,
  FiCoffee,
  FiImage,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import AdminThemeToggle from '../components/admin/AdminThemeToggle';
import AdminGuard from '../components/AdminGuard';
import { useAuth } from '../providers/AuthProvider';

const navigation = [
  { href: '/admin', label: 'داشبورد مدیریت', icon: FiBarChart2 },
  { href: '/admin/products', label: 'مدیریت محصولات', icon: FiBox },
  { href: '/admin/categories', label: 'مدیریت دسته‌بندی‌ها', icon: FiLayers },
  { href: '/admin/flavors', label: 'مدیریت طعم‌ها', icon: FiCoffee },
  { href: '/admin/brands', label: 'مدیریت برندها', icon: FiShield },
  { href: '/admin/users', label: 'مدیریت کاربران', icon: FiUsers },
  { href: '/admin/sliders', label: 'مدیریت اسلایدرها', icon: FiImage },
  { href: '/admin/comments', label: 'مدیریت کامنت‌ها', icon: FiMessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentTitle = useMemo(() => {
    const item = navigation.find((entry) => entry.href === pathname);
    return item?.label ?? 'داشبورد مدیریت';
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push('/auth/login');
  }

  return (
    <AdminGuard>
      <div className="admin-theme bg-background text-foreground min-h-screen">
        <div className="flex min-h-screen">
          <aside className="border-border bg-surface fixed inset-y-0 right-0 z-40 hidden w-72 border-l px-4 py-6 lg:flex lg:flex-col">
            <div className="border-border mb-8 flex items-center gap-3 border-b pb-5">
              <div className="bg-accent-soft text-accent flex h-11 w-11 items-center justify-center rounded-lg text-lg font-black">
                F
              </div>
              <Link href="/" className="flex flex-col">
                <p className="text-muted text-xs">Management</p>
                <p className="text-foreground text-lg font-black">FitMokamel</p>
              </Link>
            </div>

            <nav className="space-y-2">
              {navigation.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || (href !== '/admin' && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      'group flex min-h-11 items-center justify-between rounded-md border px-3 py-2.5 text-sm font-bold transition',
                      isActive
                        ? 'border-accent/40 bg-accent-soft text-accent'
                        : 'bg-surface-1 text-foreground hover:border-border-strong hover:bg-surface-3 border-transparent',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="text-base" />
                      {label}
                    </span>
                    <span className="text-muted group-hover:text-foreground text-[10px] transition">
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-border bg-surface-1 mt-auto rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface-3 text-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                  {user?.name?.slice(0, 1) ?? 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-bold">
                    {user?.name ?? 'ادمین'}
                  </p>
                  <p className="text-muted truncate text-xs">
                    {user?.email ?? 'admin@showcase.com'}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 lg:mr-72">
            <header className="border-border bg-surface/95 sticky top-0 z-30 border-b backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="border-border bg-surface-1 text-foreground inline-flex h-10 w-10 items-center justify-center rounded-md border lg:hidden"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                  >
                    <FiMenu className="text-lg" />
                  </button>
                  <div>
                    <p className="text-muted text-[11px] font-bold tracking-[0.12em]">
                      ADMIN PANEL
                    </p>
                    <h1 className="text-foreground mt-1 text-xl font-black">{currentTitle}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="border-border bg-surface-1 hidden items-center gap-3 rounded-md border px-3 py-2 md:flex">
                    <div className="bg-accent-soft text-accent flex h-8 w-8 items-center justify-center rounded-full">
                      <FiUser className="text-sm" />
                    </div>
                    <div className="text-right">
                      <p className="text-muted text-xs">کاربر</p>
                      <p className="text-foreground text-sm font-bold">{user?.name ?? 'مدیر'}</p>
                    </div>
                  </div>

                  <AdminThemeToggle />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="border-border bg-surface-1 text-foreground hover:bg-surface-3 inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-bold transition"
                  >
                    <FiLogOut />
                    خروج
                  </button>
                </div>
              </div>
            </header>

            <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="border-border bg-surface absolute top-0 right-0 h-full w-72 border-l p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-soft text-accent flex h-10 w-10 items-center justify-center rounded-lg text-lg font-black">
                    S
                  </div>
                  <div>
                    <p className="text-muted text-xs">Management</p>
                    <p className="text-foreground font-black">Showcase</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="bg-surface-1 text-foreground flex h-9 w-9 items-center justify-center rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  <FiX />
                </button>
              </div>

              <nav className="space-y-2">
                {navigation.map(({ href, label, icon: Icon }) => {
                  const isActive =
                    pathname === href || (href !== '/admin' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        'flex min-h-11 items-center justify-between rounded-md border px-3 py-2.5 text-sm font-bold',
                        isActive
                          ? 'border-accent/40 bg-accent-soft text-accent'
                          : 'bg-surface-1 text-foreground hover:bg-surface-3 border-transparent',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-3">
                        <Icon />
                        {label}
                      </span>
                      <span>→</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
