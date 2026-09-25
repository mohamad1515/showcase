'use client';

import Link from 'next/link';
import HeaderActions, { navItems, socialLinks } from './HeaderActions';
import SearchBox from './SearchBox';
import Image from 'next/image';
import Logo from '@/public/logo.png';
import { LuAlignJustify } from 'react-icons/lu';

export default function SiteHeader() {
  return (
    <header className="border-border sticky top-0 z-50 border-b bg-white" dir="rtl">
      <div className="overflow-hidden border-b border-black bg-[#8cff64]">
        <div className="relative flex h-9 items-center overflow-hidden">
          <div className="announcement-track absolute text-sm font-bold whitespace-nowrap text-black">
            تخفیف ویژه محصولات منتخب فیت مکمل — ارسال رایگان برای سفارش‌های بالای یک میلیون تومان
          </div>
        </div>
      </div>

      <div className="border-border border-b">
        <div className="flex h-20 w-full items-center gap-4 px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="border-border text-foreground hover:border-foreground hover:bg-surface flex h-9 flex-shrink-0 items-center rounded-full border bg-transparent px-4 text-sm font-bold transition-colors"
          >
            <Image src={Logo} alt={'تصویر محصول'} width={250} height={80} />
          </Link>

          {/* Search */}
          <div className="flex flex-1 items-center justify-center px-2 sm:px-6">
            <div className="w-full max-w-4xl">
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
      <div className="border-border border-b">
        <div className="flex min-h-14 w-full items-center gap-6 px-4 sm:px-6 lg:px-10">
          {/* Categories Button */}
          <button
            type="button"
            className="border-border text-foreground hover:border-foreground hover:bg-surface flex h-9 w-[300px] items-center justify-between rounded-full border bg-transparent px-6 text-sm font-bold transition-colors"
          >
            <p>دسـته‌بـندی‌ها</p>
            <LuAlignJustify size={15} className="ml-3" />
          </button>

          {/* Main Navigation */}
          <nav className="hidden flex-1 items-center gap-2 md:flex" aria-label="منوی اصلی">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground after:bg-foreground relative flex items-center rounded-md px-4 py-2 text-lg font-extrabold after:absolute after:right-4 after:bottom-0 after:left-4 after:h-px after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="mr-auto hidden items-center gap-2 sm:flex">
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
