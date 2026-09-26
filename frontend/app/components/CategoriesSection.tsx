'use client';

import React from 'react';
import ByCategories from './byCategories';

const CategoriesSection = () => {
  return (
    <section id="categories" className="space-y-5">
      <div className="flex">
        <h2 className="h-display mt-2 pl-4 text-5xl font-extrabold text-[#a8a8a8]">خرید بر اساس</h2>
        <h1 className="h-display text-foreground mt-2 text-5xl font-black">دسته‌بندی</h1>
      </div>

      <div>
        <ByCategories />
      </div>
    </section>
  );
};

export default CategoriesSection;
