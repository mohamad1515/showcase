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
      <div className="min-h-screen bg-[#f5f5f5] text-[#1f2937]">
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 right-0 z-40 hidden w-72 border-l border-[#e5e7eb] bg-white/95 px-4 py-6 backdrop-blur-xl lg:flex lg:flex-col">
            <div className="mb-8 flex items-center gap-3 border-b border-[#e5e7eb] pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22c55e]/10 text-lg font-black text-[#16a34a] ring-1 ring-[#22c55e]/30">
                F
              </div>
              <Link href="/" className="flex flex-col">
                <p className="text-xs text-[#6b7280]">Management</p>
                <p className="text-lg font-black text-[#1f2937]">FitMokamel</p>
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
                      'group flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-bold transition',
                      isActive
                        ? 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#166534] shadow-[inset_0_0_0_1px_rgba(34,197,94,0.15)]'
                        : 'border-transparent bg-[#f3f4f6] text-[#374151] hover:border-[#d1d5db] hover:bg-[#e5e7eb] hover:text-[#111827]',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="text-base" />
                      {label}
                    </span>
                    <span className="text-[10px] text-[#6b7280] transition group-hover:text-[#374151]">
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-[#e5e7eb] bg-[#f3f4f6] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d1d5db] text-sm font-bold text-[#374151]">
                  {user?.name?.slice(0, 1) ?? 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#111827]">
                    {user?.name ?? 'ادمین'}
                  </p>
                  <p className="truncate text-xs text-[#6b7280]">
                    {user?.email ?? 'admin@showcase.com'}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 lg:mr-72">
            <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/90 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d1d5db] bg-[#f3f4f6] text-[#374151] lg:hidden"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                  >
                    <FiMenu className="text-lg" />
                  </button>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.26em] text-[#6b7280]">
                      ADMIN PANEL
                    </p>
                    <h1 className="mt-1 text-xl font-black text-[#111827]">{currentTitle}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 md:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/10 text-[#16a34a]">
                      <FiUser className="text-sm" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6b7280]">کاربر</p>
                      <p className="text-sm font-bold text-[#111827]">{user?.name ?? 'مدیر'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d1d5db] bg-[#f3f4f6] px-3 py-2 text-sm font-bold text-[#374151] transition hover:bg-[#e5e7eb] hover:text-[#111827]"
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
            className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute top-0 right-0 h-full w-72 border-l border-[#e5e7eb] bg-white p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22c55e]/10 text-lg font-black text-[#16a34a] ring-1 ring-[#22c55e]/30">
                    S
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280]">Management</p>
                    <p className="font-black text-[#111827]">Showcase</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#374151]"
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
                        'flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-bold',
                        isActive
                          ? 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#166534]'
                          : 'border-transparent bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] hover:text-[#111827]',
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
