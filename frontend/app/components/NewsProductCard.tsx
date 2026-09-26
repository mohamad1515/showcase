'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../lib/products';
import AddToCartButton from './AddToCartButton';

export default function NewsProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  const image =
    [product.mainImage, product.images?.[0]].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    ) ?? '/images/product.png';

  return (
    <article className="group border-border bg-card hover:border-accent relative flex h-full flex-col overflow-hidden rounded-lg border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      {/* Product title */}
      <Link href={`/products/${product.slug}`} className="pt-2 pr-4">
        <h1 className="text-foreground group-hover:text-accent text-lg leading-6 font-black transition-colors duration-300">
          {product.name}
        </h1>

        <p className="text-muted mt-2 line-clamp-2 min-h-6 text-xs leading-5">{product.tagline}</p>
      </Link>

      {/* Product image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-background relative mt-2 aspect-[4/3.6] overflow-hidden rounded-md">
          <Image
            src={image}
            alt={product.name || product.persianName || 'تصویر محصول'}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-3"
          />

          {!inStock && (
            <span className="bg-danger-soft text-danger absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold">
              ناموجود
            </span>
          )}
        </div>
      </Link>

      {/* Bottom area */}
      <div className="relative mt-auto pt-3">
        {/* Reserved bottom space */}
        <div className="relative h-[80px] overflow-hidden">
          {/* Price */}
          <div className="absolute bottom-6 left-4 z-20 transition-transform duration-500 ease-out group-hover:-translate-y-[30px]">
            <span className="tabular-fa text-foreground text-base font-black">
              {product.price}
              <span className="text-muted mr-1 text-[10px] font-bold">تومان</span>
            </span>
          </div>

          {/* Sliding cart panel */}
          <div className="absolute right-[-8px] bottom-0 left-[-8px] z-10 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0">
            <AddToCartButton
              productSlug={product.slug}
              disabled={!inStock}
              className="!mt-0 !w-full !rounded-none border-0 py-3 text-lg transition-none"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
