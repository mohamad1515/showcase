'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  FiActivity,
  FiArrowLeft,
  FiBox,
  FiCheckCircle,
  FiCreditCard,
  FiMessageSquare,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { getAdminComments, getCategories, getOrders, getProducts, getUsers } from '../lib/graphql';

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const width = 160;
  const height = 52;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const path = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-full overflow-visible"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  tone,
  points,
}: {
  title: string;
  value: string;
  change: string;
  icon: IconType;
  tone: string;
  points: number[];
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-[#fff] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#6b7280]">{title}</p>
          <p className="mt-3 text-3xl font-black text-[#111827]">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="text-lg" />
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-2 py-1 text-xs font-bold text-[#374151]">
          <FiTrendingUp className="text-[11px]" />
          {change}
        </div>
        <div className="w-28">
          <Sparkline points={points} color={tone.includes('#22c55e') ? '#22c55e' : '#6b7280'} />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState({
    products: 0,
    users: 0,
    orders: 0,
    comments: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, users, comments, orders, categories] = await Promise.all([
          getProducts(),
          getUsers(),
          getAdminComments(),
          getOrders(),
          getCategories(),
        ]);

        const unanswered = comments.filter((comment) => comment.status === 'UNANSWERED').length;

        setMetrics({
          products: products.length,
          users: users.length,
          orders: orders.length,
          comments: unanswered,
          categories: categories.length,
        });
      } catch {
        setMetrics({ products: 0, users: 0, orders: 0, comments: 0, categories: 0 });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = [
    {
      title: 'فروش این ماه',
      value: '₪ 128,400,000',
      change: '+18.4%',
      icon: FiCreditCard,
      tone: 'bg-[#22c55e]/10 text-[#16a34a]',
      points: [12, 14, 10, 17, 20, 19, 22, 21],
    },
    {
      title: 'تعداد بازدید',
      value: '56.4K',
      change: '+12.1%',
      icon: FiActivity,
      tone: 'bg-[#e5e7eb] text-[#374151]',
      points: [8, 11, 13, 12, 15, 18, 17, 19],
    },
    {
      title: 'تعداد کاربران',
      value: String(metrics.users),
      change: '+9.3%',
      icon: FiUsers,
      tone: 'bg-[#f3f4f6] text-[#374151]',
      points: [5, 7, 6, 9, 8, 11, 12, 10],
    },
    {
      title: 'تعداد محصولات',
      value: String(metrics.products),
      change: '+4.8%',
      icon: FiBox,
      tone: 'bg-[#e5e7eb] text-[#374151]',
      points: [7, 9, 10, 12, 11, 14, 13, 16],
    },
    {
      title: 'کامنت‌های پاسخ‌داده‌نشده',
      value: String(metrics.comments),
      change: '-2.1%',
      icon: FiMessageSquare,
      tone: 'bg-[#f3f4f6] text-[#374151]',
      points: [18, 16, 15, 14, 13, 12, 11, 10],
    },
    {
      title: 'تعداد سفارش‌ها',
      value: String(metrics.orders),
      change: '+7.6%',
      icon: FiShoppingBag,
      tone: 'bg-[#22c55e]/10 text-[#16a34a]',
      points: [4, 7, 8, 7, 9, 11, 10, 12],
    },
  ];

  const quickLinks = [
    { href: '/admin/products', label: 'مدیریت محصولات', meta: `${metrics.products} کالا` },
    { href: '/admin/categories', label: 'مدیریت دسته‌بندی‌ها', meta: `${metrics.categories} دسته` },
    { href: '/admin/users', label: 'مدیریت کاربران', meta: `${metrics.users} حساب` },
    { href: '/admin/comments', label: 'مدیریت کامنت‌ها', meta: `${metrics.comments} جدید` },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-[#16a34a]">DASHBOARD</p>
            <h2 className="mt-3 text-3xl font-black text-[#111827] md:text-4xl">داشبورد مدیریت</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
              اطلاعات اصلی فروشگاه را در یک نگاه بررسی کنید و به سرعت به مهم‌ترین بخش‌های مدیریتی
              دسترسی پیدا کنید.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-3 text-sm font-bold text-[#166534]">
            <FiCheckCircle className="text-base" />
            {loading ? 'در حال بارگذاری داده‌ها...' : 'سیستم آنلاین و فعال'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#e5e7eb] bg-[#f3f4f6] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#6b7280]">نرخ رشد</p>
              <h3 className="mt-1 text-xl font-black text-[#111827]">نمای کلی عملکرد</h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-2.5 py-1 text-xs font-bold text-[#374151]">
              <FiTrendingUp />
              +22.6%
            </span>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
            <svg
              viewBox="0 0 800 220"
              className="h-56 w-full"
              aria-label="Dashboard chart"
              role="img"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1="0"
                  y1={40 + line * 45}
                  x2="800"
                  y2={40 + line * 45}
                  stroke="#1f2937"
                  strokeDasharray="4 8"
                />
              ))}
              <path
                d="M0 180 C100 155, 120 120, 200 128 S330 100, 420 108 S540 60, 610 78 S710 42, 800 54 L800 220 L0 220 Z"
                fill="url(#chart-fill)"
              />
              <path
                d="M0 180 C100 155, 120 120, 200 128 S330 100, 420 108 S540 60, 610 78 S710 42, 800 54"
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-[#f3f4f6] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#6b7280]">دسترسی سریع</p>
              <h3 className="mt-1 text-xl font-black text-[#111827]">مدیریت‌ها</h3>
            </div>
          </div>

          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-3 py-3 transition hover:border-[#22c55e]/40 hover:bg-[#f9fafb]"
              >
                <div>
                  <p className="font-bold text-[#111827]">{link.label}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">{link.meta}</p>
                </div>
                <FiArrowLeft className="text-[#6b7280]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
