'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../lib/products';
import AddToCartButton from './AddToCartButton';
import StarRating from './reviews/StarRating';

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  const image =
    [product.mainImage, product.images?.[0]].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    ) ?? '/images/product.png';

  return (
    <article className="group border-border bg-card hover:border-accent relative flex h-full flex-col overflow-hidden rounded-lg border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      {/* Product title */}
      <Link href={`/products/${product.slug}`} className="pt-2 pr-4">
        <h2 className="text-foreground group-hover:text-accent line-clamp-2 min-h-10 text-sm leading-5 font-medium transition-colors duration-300">
          {product.name}
        </h2>

        <p className="text-muted mt-1 line-clamp-1 min-h-5 text-xs leading-5">{product.tagline}</p>
        {product.reviewCount > 0 && (
          <span className="mt-2 flex items-center gap-1.5">
            <StarRating value={product.rating} size="sm" />
            <span className="text-muted text-[11px]">({product.reviewCount})</span>
          </span>
        )}
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

      <div className="mt-auto space-y-3 px-3 pt-4 pb-3 sm:px-4 sm:pb-4">
        <p className="tabular-fa text-foreground text-sm font-bold">
          {product.price}
          <span className="text-muted mr-1 text-xs font-normal">تومان</span>
        </p>
        <AddToCartButton
          productSlug={product.slug}
          disabled={!inStock}
          className="!mt-0 !min-h-10 !w-full !rounded-md !py-2 !text-xs sm:!text-sm"
        />
      </div>
    </article>
  );
}
