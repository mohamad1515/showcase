'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category, Product } from '../lib/products';

export default function GalleryFilter({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  const galleryItems = useMemo(() => products.slice(0, 9), [products]);
  const filteredItems = useMemo(
    () =>
      galleryItems.filter(
        (item) => activeCategory === 'all' || item.category === activeCategory,
      ),
    [galleryItems, activeCategory],
  );

  return (
    <section id="gallery" className="space-y-8">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-muted text-sm font-bold">گالری</p>
        <h2 className="text-foreground mt-2 text-2xl font-black sm:text-[28px]">نمایش محصولات</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={
            activeCategory === 'all'
              ? 'bg-accent text-foreground h-10 rounded-md px-4 text-sm font-black'
              : 'border-border text-foreground hover:border-accent h-10 rounded-md border px-4 text-sm font-bold transition-colors'
          }
        >
          همه
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setActiveCategory(category.slug)}
            className={
              activeCategory === category.slug
                ? 'bg-accent text-foreground h-10 rounded-md px-4 text-sm font-black'
                : 'border-border text-foreground hover:border-accent h-10 rounded-md border px-4 text-sm font-bold transition-colors'
            }
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {filteredItems.map((item) => {
          const image =
            [item.mainImage, item.images?.[0]].find(
              (value): value is string => typeof value === 'string' && value.trim().length > 0,
            ) ?? '/images/product.png';

          return (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="bg-background group relative block aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={image}
                alt={item.name || item.persianName}
                fill
                sizes="(min-width: 1024px) 25vw, 33vw"
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
