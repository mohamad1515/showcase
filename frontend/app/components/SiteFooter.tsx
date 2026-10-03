'use client';

import Link from 'next/link';
import { navItems, socialLinks } from './HeaderActions';

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-[var(--color-footer)] text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-5 lg:grid-cols-4 lg:px-6 lg:py-16">
        <div>
          <h2 className="text-xl font-black">فیت مکمل</h2>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[var(--color-footer-text)]">
            مکمل‌های ورزشی را با اطلاعات روشن‌تر بررسی کن و متناسب با نیازت انتخاب کن.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="hover:border-accent hover:text-accent inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white transition-colors"
              >
                <Icon size={16} aria-hidden />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black">فروشگاه</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-footer-text)]">
            <Link href="/products" className="hover:text-accent transition-colors">
              همهٔ محصولات
            </Link>
            <Link href="/cart" className="hover:text-accent transition-colors">
              سبد خرید
            </Link>
            <Link href="/orders" className="hover:text-accent transition-colors">
              سفارش‌های من
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black">دسترسی سریع</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-footer-text)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black">تماس با ما</h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-footer-text)]">
            تهران، خیابان ورزش، پلاک ۲۴
            <br />
            <a href="tel:02112345678" className="hover:text-accent">
              ۰۲۱-۱۲۳۴۵۶۷۸
            </a>
            <br />
            <a href="mailto:info@fitmokamel.ir" className="hover:text-accent">
              info@fitmokamel.ir
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-xs text-[var(--color-footer-text)] sm:px-5 lg:px-6">
          © فیت مکمل
        </p>
      </div>
    </footer>
  );
}
