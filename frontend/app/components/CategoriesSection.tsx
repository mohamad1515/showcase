'use client';

import React from 'react';
import ByCategories from './byCategories';
import type { Category } from '../lib/products';

const CategoriesSection = ({ categories }: { categories: Category[] }) => {
  return (
    <section id="categories" className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h2 className="h-display text-muted text-2xl font-extrabold sm:text-[28px]">
          خرید بر اساس
        </h2>
        <h2 className="h-display text-foreground text-2xl font-black sm:text-[28px]">دسته‌بندی</h2>
      </div>

      <div>
        <ByCategories categories={categories} />
      </div>
    </section>
  );
};

export default CategoriesSection;
