'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const categories = [
  {
    id: 1,
    label: 'All Supplements',
    path: '/images/category/cat1.png',
  },
  {
    id: 2,
    label: 'Sports Nutrition',
    path: '/images/category/cat2.png',
  },
  {
    id: 3,
    label: 'Protein',
    path: '/images/category/cat3.png',
  },
  {
    id: 4,
    label: 'Vitamins',
    path: '/images/category/cat4.png',
  },
  {
    id: 5,
    label: 'Performance',
    path: '/images/category/cat5.png',
  },
  {
    id: 6,
    label: 'Health Support',
    path: '/images/category/cat6.png',
  },
  {
    id: 7,
    label: 'Digestion',
    path: '/images/category/cat7.png',
  },
  {
    id: 8,
    label: 'Vegan',
    path: '/images/category/cat8.png',
  },
];

export default function ByCategories() {
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="scrollbar-hide flex justify-around gap-3 overflow-x-auto scroll-smooth px-11"
      >
        {categories.map((item) => (
          <Link
            key={item.id}
            href="/products"
            className="group relative flex min-w-[140px] flex-col items-center justify-center rounded-full"
          >
            <div className="group relative">
              <Image
                src={item.path}
                alt={item.label}
                width={142}
                height={130}
                className="h-[130px] max-w-[130px] bg-transparent transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute top-[19px] -z-10 h-[125px] w-[125px] rounded-full p-2 opacity-0 transition-all duration-300 group-hover:bg-[#8cff64] group-hover:opacity-100" />
            </div>
            <p className="mt-6 text-lg font-bold text-black">{item.label}</p>
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
