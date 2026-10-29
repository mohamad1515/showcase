'use client';

import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Swiper as SwiperInstance } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { uniqueProducts, type Product } from '../lib/products';
import ProductCard from './ProductCard';

export default function RelatedProductsCarousel({ products }: { products: Product[] }) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const uniqueRelated = uniqueProducts(products);

  return (
    <section className="mt-12" dir="rtl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-foreground text-xl font-black">محصولات مرتبط</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="محصول قبلی"
            className="bg-surface text-foreground hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition"
          >
            <FiChevronRight aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="محصول بعدی"
            className="bg-surface text-foreground hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition"
          >
            <FiChevronLeft aria-hidden />
          </button>
        </div>
      </div>
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        slidesPerView={1}
        slidesPerGroup={1}
        spaceBetween={16}
        loop={uniqueRelated.length > 1}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="w-full select-none"
      >
        {uniqueRelated.map((product) => (
          <SwiperSlide key={product.slug} className="h-auto pb-1">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
