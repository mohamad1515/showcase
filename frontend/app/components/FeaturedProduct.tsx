'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../lib/products';
import AddToCartButton from './AddToCartButton';
import QuantityStepper from './ui/QuantityStepper';
import StarRating from './reviews/StarRating';

export default function FeaturedProduct({ product }: { product: Product | undefined }) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const image =
    [product.mainImage, product.images?.[0]].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    ) ?? '/images/product.png';

  return (
    <section className="border-border bg-card grid gap-8 rounded-lg border p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
      <div className="bg-background relative order-2 aspect-square overflow-hidden rounded-lg lg:order-1">
        <Image
          src={image}
          alt={product.name || product.persianName}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain p-6"
        />
      </div>

      <div className="order-1 lg:order-2">
        <p className="text-muted text-sm font-bold">خرید پیشنهادی</p>
        <h2 className="text-foreground mt-2 text-2xl leading-tight font-black sm:text-3xl">
          {product.name || product.persianName}
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <StarRating value={product.rating} size="sm" />
          <span className="text-muted text-xs">({product.reviewCount} نظر)</span>
        </div>

        <p className="tabular-fa text-foreground mt-4 text-3xl font-black">
          {product.price}
          <span className="text-muted mr-1.5 text-sm font-normal">تومان</span>
        </p>

        <p className="text-muted mt-4 max-w-md text-sm leading-7">{product.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} />
          <AddToCartButton productSlug={product.slug} disabled={product.stock <= 0} />
          <Link
            href={`/products/${product.slug}`}
            className="text-foreground hover:text-accent-strong text-sm font-bold underline-offset-4 hover:underline"
          >
            مشاهدهٔ کامل محصول
          </Link>
        </div>
      </div>
    </section>
  );
}
