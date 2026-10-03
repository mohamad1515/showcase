'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getHomeCategories } from '../data/categories';
import type { Category } from '../lib/products';

export default function ByCategories({ categories }: { categories: Category[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const homeCategories = getHomeCategories(categories);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    containerRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full space-y-10">
      {/* Previous button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Previous categories"
        className="hover:bg-accent absolute top-1/2 left-0 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition"
      >
        <FiChevronLeft size={20} />
      </button>

      {/* Categories */}
      <div
        ref={containerRef}
        className="scrollbar-hide flex snap-x snap-mandatory justify-start gap-3 overflow-x-auto scroll-smooth px-11 sm:justify-around"
      >
        {homeCategories.map((item) => (
          <Link
            key={item.id}
            href={`/category/${item.slug}`}
            className="group relative flex min-w-[140px] snap-start flex-col items-center justify-center rounded-md"
          >
            <div className="group relative">
              <Image
                src={item.image}
                alt={item.name}
                width={142}
                height={130}
                className="h-[130px] w-auto max-w-[130px] bg-transparent transition-transform duration-300 group-hover:scale-105"
              />

              <div className="group-hover:bg-accent absolute top-[19px] -z-10 h-[125px] w-[125px] rounded-full p-2 opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </div>
            <p className="mt-6 text-lg font-bold text-black">{item.name}</p>
          </Link>
        ))}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Next categories"
        className="hover:bg-accent absolute top-1/2 right-0 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}
