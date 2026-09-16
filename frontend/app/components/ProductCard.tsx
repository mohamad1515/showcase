"use client";

import Image from "next/image";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import type { Product } from "../lib/products";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;
  const image =
    [product.mainImage, product.images?.[0]].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    ) ?? "/images/product.png";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition duration-150 hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-background p-2">
          <Image
            src={image}
            alt={product.name || product.persianName || "تصویر محصول"}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="rounded-md object-cover transition duration-500 group-hover:scale-[1.06]"
          />
          <span className="absolute right-3 top-3 rounded-sm border border-border bg-surface/95 px-2 py-1 text-[10px] font-bold text-foreground">
            {product.brand}
          </span>
          {!inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-danger-soft px-2.5 py-1 text-[10px] font-bold text-danger">
              ناموجود
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-black leading-6 text-foreground transition group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <FiStar className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
          <span className="font-bold text-foreground">4.5</span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-5 text-muted">
          {product.tagline}
        </p>

        {/* Compact spec strip — echoes the facts-panel styling on the product page */}
        <div className="mt-3 flex items-center gap-3 border-y border-border py-2 text-[11px] font-bold text-muted">
          <span>{product.weight}</span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span>{product.quantity}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="tabular-fa text-base font-black text-foreground">
            {product.price}
            <span className="mr-1 text-[10px] font-bold text-muted">تومان</span>
          </span>
        </div>

        <AddToCartButton
          productSlug={product.slug}
          disabled={!inStock}
          className="mt-3 w-full"
        />
      </div>
    </article>
  );
}
