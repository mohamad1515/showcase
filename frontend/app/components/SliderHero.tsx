'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import type { Slider } from '../lib/products';

export default function SliderHero({ slides }: { slides: Slider[] }) {
  const validSlides =
    slides.length > 0
      ? slides
      : [
          {
            id: '0',
            title: 'بهترین مکمل را برای هدف تمرینی خودت انتخاب کن',
            subtitle: 'محصولات ورزشی و غذایی با اطلاعات شفاف و کاربردی',
            image: '/images/slider/slider-1.jpg',
            link: '/products',
          },
        ];

  return (
    <section className="relative mx-auto w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={validSlides.length > 1}
        autoplay={
          validSlides.length > 1
            ? {
                delay: 10000,
                disableOnInteraction: false,
              }
            : false
        }
        pagination={{
          clickable: true,
        }}
        className="h-[240px] rounded-md sm:h-[320px] lg:h-[420px]"
      >
        {validSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[240px] overflow-hidden rounded-md sm:h-[320px] lg:h-[420px]">
              <Link
                href={slide.link || '/products'}
                aria-label={`مشاهدهٔ محصولات: ${slide.title}`}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === validSlides[0].id}
                  sizes="100vw"
                  className="object-cover object-[64%_center] sm:object-center"
                />
                <span className="bg-accent text-foreground hover:bg-accent-strong absolute bottom-4 left-4 inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-bold transition-colors sm:bottom-6 sm:left-6">
                  مشاهده محصولات
                  <FiArrowLeft size={16} aria-hidden />
                </span>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
