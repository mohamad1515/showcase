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
    <article
      className="group glass relative flex h-full flex-col overflow-hidden rounded-lg transition-[border-color,transform,box-shadow] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:border-accent/70 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lg motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1"
      style={{ transitionTimingFunction: 'var(--motion-ease-out)' }}
    >
      {/* One link covers the whole card body (image + details) — avoids two
          adjacent links to the same destination, which doubles tab stops and
          screen-reader announcements. */}
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-1 flex-col transition-transform duration-100 ease-out active:scale-[0.98]"
      >
        {/* Product image */}
        <div className="bg-background relative aspect-[4/3.6] overflow-hidden">
          <Image
            src={image}
            alt={product.name || product.persianName || 'تصویر محصول'}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-3"
          />

          {!inStock && (
            <span className="bg-danger-soft text-danger backdrop-blur-sm absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold">
              ناموجود
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-1 flex-col gap-1.5 px-3 pt-3 sm:px-4">
          <h2 className="text-foreground group-hover:text-accent line-clamp-2 min-h-10 text-sm leading-5 font-semibold transition-colors duration-300">
            {product.name}
          </h2>

          <p className="text-muted line-clamp-1 min-h-5 text-xs leading-5">{product.tagline}</p>

          {/* Reserved height even with no reviews, so prices stay aligned row-to-row */}
          <span className="flex min-h-4 items-center gap-1.5">
            {product.reviewCount > 0 && (
              <>
                <StarRating value={product.rating} size="sm" />
                <span className="text-muted text-[11px]">({product.reviewCount})</span>
              </>
            )}
          </span>

          <p className="tabular-fa text-foreground mt-auto text-base font-black">
            {product.price}
            <span className="text-muted mr-1 text-xs font-normal">تومان</span>
          </p>
        </div>
      </Link>

      <div className="px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
        <AddToCartButton
          productSlug={product.slug}
          disabled={!inStock}
          className="!mt-0 !min-h-10 !w-full !rounded-md !py-2 !text-xs sm:!text-sm"
        />
      </div>
    </article>
  );
}
