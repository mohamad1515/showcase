"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiArrowLeft,
  FiGrid,
  FiImage,
  FiLayers,
  FiUsers,
} from "react-icons/fi";
import AdminGuard from "../components/AdminGuard";

const sections: {
  href: string;
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    href: "/admin/users",
    title: "مدیریت کاربران",
    description:
      "افزودن، ویرایش و فعال/غیرفعال کردن کاربران با نقش کاربر معمولی.",
    icon: FiUsers,
  },
  {
    href: "/admin/products",
    title: "مدیریت محصولات",
    description: "مشاهده، ویرایش، اضافه کردن و حذف محصولات فروشگاه.",
    icon: FiGrid,
  },
  {
    href: "/admin/categories",
    title: "دسته‌بندی‌ها",
    description: "دسته‌بندی جدید بسازید، ویرایش کنید و دسته‌ها را حذف کنید.",
    icon: FiLayers,
  },
  {
    href: "/admin/sliders",
    title: "اسلایدر",
    description: "کنترل اسلایدها و مشاهده/ویرایش هر اسلاید در پنل مدیریت.",
    icon: FiImage,
  },
];

export default function AdminPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-10 rounded-lg border border-border bg-surface p-8 shadow-sm">
          <p className="h-eyebrow">پنل ادمین</p>
          <h6 className="h-display mt-4 text-3xl text-foreground sm:text-4xl">
            داشبورد مدیریت
          </h6>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border border-border bg-surface p-7 shadow-sm transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent-soft text-xl text-accent">
                <section.icon aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-black text-foreground transition group-hover:text-accent">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {section.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-accent">
                بازدید
                <FiArrowLeft aria-hidden />
              </span>
            </Link>
          ))}
        </section>
      </main>
    </AdminGuard>
  );
}
