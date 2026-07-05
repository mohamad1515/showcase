"use client";

import Link from "next/link";
import AdminGuard from "../components/AdminGuard";

const sections = [
  {
    href: "/admin/users",
    title: "مدیریت کاربران",
    description:
      "افزودن، ویرایش و فعال/غیرفعال کردن کاربران با نقش کاربر معمولی.",
  },
  {
    href: "/admin/products",
    title: "مدیریت محصولات",
    description: "مشاهده، ویرایش، اضافه کردن و حذف محصولات فروشگاه.",
  },
  {
    href: "/admin/categories",
    title: "دسته‌بندی‌ها",
    description: "دسته‌بندی جدید بسازید، ویرایش کنید و دسته‌ها را حذف کنید.",
  },
  {
    href: "/admin/sliders",
    title: "اسلایدر",
    description: "کنترل اسلایدها و مشاهده/ویرایش هر اسلاید در پنل مدیریت.",
  },
];

export default function AdminPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <section className="mb-10 rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-black text-accent">پنل ادمین</p>
          <h1 className="mt-4 text-3xl font-black text-foreground sm:text-4xl">
            داشبورد مدیریت
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            فقط ادمین اجازه مشاهده این صفحه را دارد. از این بخش می‌توانید
            کاربران، محصولات، دسته‌بندی‌ها و اسلایدر را مدیریت کنید.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-3xl border border-border bg-surface p-7 shadow-sm transition hover:-translate-y-1 hover:border-accent/70 hover:shadow-xl"
            >
              <h2 className="text-xl font-black text-foreground transition group-hover:text-accent">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {section.description}
              </p>
              <span className="mt-6 inline-flex text-sm font-black text-accent">
                بازدید
              </span>
            </Link>
          ))}
        </section>
      </main>
    </AdminGuard>
  );
}
