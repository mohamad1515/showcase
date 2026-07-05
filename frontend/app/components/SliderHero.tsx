"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Slider } from "../lib/products";

export default function SliderHero({ slides }: { slides: Slider[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const validSlides =
    slides.length > 0
      ? slides
      : [
          {
            id: "0",
            title: "بهترین مکمل را برای هدف تمرینی خودت انتخاب کن",
            subtitle: "محصولات ورزشی و غذایی با اطلاعات شفاف و کاربردی",
            image: "/images/slider/slider-1.jpg",
            link: "/products",
          },
        ];
  const slide = validSlides[activeIndex];

  useEffect(() => {
    if (validSlides.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % validSlides.length);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [validSlides.length]);

  useEffect(() => {
    if (activeIndex >= validSlides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, validSlides.length]);

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/35" />
        <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-background via-background/90 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-14 sm:px-8 lg:px-12">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex rounded-md border border-border bg-surface/90 px-4 py-2 text-sm font-bold text-accent shadow-sm">
            انتخاب دقیق مکمل
          </p>
          <h1 className="text-4xl font-black leading-tight text-foreground sm:text-5xl">
            {slide.title}
          </h1>
          <p className="text-base leading-8 text-muted sm:text-lg">
            {slide.subtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
            >
              مشاهده محصولات
            </Link>
            <Link
              href={slide.link}
              className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-surface/90 px-6 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
            >
              جزئیات بیشتر
            </Link>
          </div>
          {validSlides.length > 1 && (
            <div className="flex items-center gap-2">
              {validSlides.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition ${idx === activeIndex ? "bg-accent" : "bg-border"}`}
                  aria-label={`نمایش اسلاید ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
