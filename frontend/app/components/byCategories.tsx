'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Swiper as SwiperInstance } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { getHomeCategories } from '../data/categories';
import type { Category } from '../lib/products';

export default function ByCategories({ categories }: { categories: Category[] }) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const homeCategories = getHomeCategories(categories);

  return (
    <div className="relative px-11" dir="rtl">
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="دستهٔ قبلی"
        className="bg-surface text-foreground hover:bg-accent absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition"
      >
        <FiChevronRight size={20} aria-hidden />
      </button>

      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        slidesPerView={2}
        slidesPerGroup={1}
        spaceBetween={12}
        loop={homeCategories.length >= 6}
        loopAddBlankSlides={false}
        allowTouchMove
        simulateTouch
        grabCursor
        speed={400}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="category-carousel w-full select-none"
      >
        {homeCategories.map((item) => (
          <SwiperSlide key={item.id} className="h-auto">
            <Link
              href={`/category/${item.slug}`}
              draggable={false}
              className="group flex h-full min-h-52 snap-start flex-col items-center justify-center rounded-md px-1 text-center"
            >
              <div className="relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={142}
                  height={130}
                  draggable={false}
                  className="h-[130px] w-auto max-w-[130px] bg-transparent object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-foreground mt-4 text-sm font-bold sm:text-base">{item.name}</p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="دستهٔ بعدی"
        className="bg-surface text-foreground hover:bg-accent absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition"
      >
        <FiChevronLeft size={20} aria-hidden />
      </button>
    </div>
  );
}
