"use client";

import { navItems } from "./HeaderActions";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-12">
        <div>
          <h2 className="text-xl font-black text-foreground">فیت مکمل</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            معرفی مکمل‌های ورزشی برای انتخاب آگاهانه‌تر. توضیحات این سایت
            جایگزین مشاوره پزشک یا متخصص تغذیه نیست.
          </p>
        </div>
        <div>
          <h3 className="font-black text-foreground">دسترسی سریع</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-muted">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-black text-foreground">تماس با ما</h3>
          <p className="mt-4 text-sm leading-7 text-muted">
            تهران، خیابان ورزش، پلاک ۲۴
            <br />
            ۰۲۱-۱۲۳۴۵۶۷۸
            <br />
            info@fitmokamel.ir
          </p>
        </div>
      </div>
    </footer>
  );
}
