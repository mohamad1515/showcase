'use client';

import Image from 'next/image';

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
    <section className="relative mx-auto max-w-7xl overflow-hidden sm:px-8 lg:px-4">
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
        className="h-[290px] rounded-xl sm:h-[433px]"
      >
        {validSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[290px] overflow-hidden rounded-xl sm:h-[433px]">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
