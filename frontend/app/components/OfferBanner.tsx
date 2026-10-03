'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import productImage from '@/public/images/products/img-6.png';

export default function OfferBanner() {
  return (
    <section className="w-full">
      <div
        className="bg-accent grid min-h-[320px] overflow-hidden rounded-md md:min-h-[300px] md:grid-cols-[1.15fr_0.85fr]"
        dir="rtl"
      >
        <div className="flex flex-col items-start justify-center px-6 py-8 sm:px-10 md:py-10">
          <p className="text-foreground/70 text-sm font-bold">برای تمرین بعدی</p>
          <h2 className="text-foreground mt-3 max-w-xl text-3xl leading-tight font-black sm:text-4xl">
            تمرینت را قدرتمند شروع کن
          </h2>
          <p className="text-foreground/80 mt-3 max-w-lg text-sm leading-6">
            محصولات پروتئینی و اطلاعات هر محصول را در فروشگاه بررسی کن.
          </p>
          <Link
            href="/products"
            className="bg-foreground mt-5 inline-flex min-h-11 items-center rounded-md px-5 text-sm font-bold text-white transition-colors hover:bg-black/80"
          >
            دیدن محصولات
          </Link>
        </div>

        <div className="relative mx-auto h-[190px] w-full max-w-[320px] sm:h-[240px] md:h-full md:max-w-none">
          <Image
            src={productImage}
            alt="ظرف مکمل پروتئین وی"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-contain p-3 drop-shadow-[0_18px_12px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:scale-105 sm:p-5"
          />
        </div>
      </div>
    </section>
  );
}
