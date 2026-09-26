'use client';

import React, { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { Product, ProductCategory } from '../lib/products';
import NewsProductCard from './NewsProductCard';

function orderProducts(products: Product[], filter: ProductCategory) {
  if (filter === 'default') return products;

  const selected = products.filter((product) => product.category === filter);
  const remaining = products.filter((product) => product.category !== filter);

  return [...selected, ...remaining];
}

export default function NewsProducts({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState<ProductCategory>('default');

  const visibleProducts = useMemo(
    () => orderProducts(products, activeFilter).slice(0, 8),
    [activeFilter, products],
  );

  return (
    <section>
      <div className="space-y-20">
        <div className="flex">
          <h1 className="h-display text-foreground mt-2 text-6xl font-black">جدیدترین‌ها</h1>
        </div>

        <div className="relative">
          <Swiper
            loop={visibleProducts.length > 4}
            slidesPerView={1}
            spaceBetween={8}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
            }}
            className="w-full"
          >
            {visibleProducts.map((product) => (
              <SwiperSlide key={product.slug}>
                <NewsProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
