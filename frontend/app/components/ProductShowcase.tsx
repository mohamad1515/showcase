'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import type { Product } from '../lib/products';
import ProductCard from './ProductCard';

export default function ProductShowcase({ products }: { products: Product[] }) {
  const visibleProducts = [...products]
    .sort((left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount)
    .slice(0, 8);

  return (
    <section id="products" className="space-y-6">
      <h2 className="h-display text-foreground text-2xl font-black sm:text-[28px]">محبوب‌ها</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          href="/products"
          className="bg-accent text-foreground hover:bg-accent-strong inline-flex min-h-11 items-center gap-2 rounded-md px-5 text-sm font-bold transition"
        >
          مشاهدهٔ همهٔ محصولات
          <FiArrowLeft aria-hidden />
        </Link>
      </div>
    </section>
  );
}
