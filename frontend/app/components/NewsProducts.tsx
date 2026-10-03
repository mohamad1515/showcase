'use client';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import type { Product } from '../lib/products';
import ProductCard from './ProductCard';

export default function NewsProducts({ products }: { products: Product[] }) {
  const visibleProducts = [...products]
    .sort((left, right) => {
      const leftDate = left.createdAt ? Date.parse(left.createdAt) : 0;
      const rightDate = right.createdAt ? Date.parse(right.createdAt) : 0;
      return rightDate - leftDate;
    })
    .slice(0, 8);

  return (
    <section className="space-y-6">
      <h2 className="h-display text-foreground text-2xl font-black sm:text-[28px]">
        تازه‌رسیده‌ها
      </h2>
      <div className="relative">
        <Swiper
          loop={visibleProducts.length > 4}
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full"
        >
          {visibleProducts.map((product) => (
            <SwiperSlide key={product.slug} className="h-auto">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
