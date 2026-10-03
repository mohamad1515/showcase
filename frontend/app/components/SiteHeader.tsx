'use client';

import Link from 'next/link';
import HeaderActions, { navItems, socialLinks } from './HeaderActions';
import SearchBox from './SearchBox';
import Image from 'next/image';
import Logo from '@/public/logo.png';
import { LuAlignJustify } from 'react-icons/lu';

export default function SiteHeader() {
  return (
    <header className="border-border top-0 z-50 border-b bg-white" dir="rtl">
      <div className="bg-accent overflow-hidden border-b border-black">
        <div className="relative flex h-9 items-center overflow-hidden">
          <div className="announcement-track text-foreground absolute text-sm font-bold whitespace-nowrap">
            تخفیف ویژه محصولات منتخب فیت مکمل — ارسال رایگان برای سفارش‌های بالای یک میلیون تومان
          </div>
        </div>
      </div>

      <div className="border-border border-b py-3">
        <div className="flex h-20 w-full items-center gap-4 px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            aria-label="فیت مکمل، صفحهٔ اصلی"
            className="text-foreground flex h-9 flex-shrink-0 items-center bg-transparent"
          >
            <Image
              src={Logo}
              alt="فیت مکمل"
              width={300}
              height={80}
              priority
              className="h-auto w-[132px] sm:w-[180px] lg:w-[210px]"
            />
          </Link>

          {/* Search */}
          <div className="hidden min-w-0 flex-1 items-center justify-center px-2 lg:flex lg:px-6">
            <div className="w-full">
              <SearchBox />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-shrink-0 items-center">
            <HeaderActions />
          </div>
        </div>
      </div>

      {/* =========================================================
          3. Navigation
      ========================================================= */}
      <div className="border-border border-b py-1">
        <div className="flex min-h-14 w-full items-center gap-6 px-4 sm:px-6 lg:px-10">
          {/* Categories Button */}
          <Link
            href="/products"
            className="border-border text-foreground hover:border-foreground hover:bg-surface hidden h-11 w-[220px] flex-shrink-0 items-center justify-between rounded-md border bg-transparent px-5 text-sm font-bold transition-colors lg:flex"
          >
            <span className="text-base font-black">دسته‌بندی‌ها</span>
            <LuAlignJustify size={15} />
          </Link>

          {/* Main Navigation */}
          <nav className="hidden flex-1 items-center gap-2 md:flex" aria-label="منوی اصلی">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground after:bg-foreground relative flex items-center rounded-md px-3 py-2 text-sm font-bold after:absolute after:right-3 after:bottom-0 after:left-3 after:h-px after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="mr-auto hidden items-center gap-2 lg:flex">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="border-border bg-surface text-foreground hover:border-accent hover:text-accent inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
              >
                <Icon size={16} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Announcement animation */}
      <style jsx>{`
        .announcement-track {
          right: 25%;
          animation: announcement-slide 8s linear infinite;
        }

        @keyframes announcement-slide {
          0% {
            transform: translateX(0);
          }

          50% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </header>
  );
}
