"use client";

import Image from "next/image";
import Link from "next/link";
import { FiBox, FiPackage, FiStar } from "react-icons/fi";
import type { Product, ProductCategory } from "../lib/products";
import AddToCartButton from "./AddToCartButton";

const categoryLabels: Record<ProductCategory, string> = {
  default: "پیشنهادی",
  popular: "محبوب",
  "best-selling": "پرفروش",
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition duration-100 hover:border-accent">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-background p-2">
          <Image
            src={product.images?.[0] ?? "/images/product.png"}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="rounded-md object-cover transition duration-500 group-hover:scale-[1.06]"
          />
          <span className="absolute right-4 top-4 rounded-sm border border-border bg-surface/95 px-2 py-1 text-[10px] font-semibold text-foreground">
            {categoryLabels[product.category]}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-black leading-6 text-foreground transition group-hover:text-accent">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-foreground">
            <span>4.5</span>
            <FiStar className="text-yellow-400" aria-hidden />
          </div>

          <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-5 text-muted">
            {product.tagline}
          </p>
        </div>

        <div className="mt-auto grid gap-2 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="tabular-fa text-base font-black text-gold">
              {product.price}
              <span className="mr-1 text-[10px] font-bold text-muted">
                تومان
              </span>
            </span>

            <div className="flex items-center gap-2 text-[10px] font-bold text-muted">
              <span className="inline-flex items-center gap-1">
                <FiBox className="text-accent" aria-hidden />
                {product.weight}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiPackage className="text-accent" aria-hidden />
                {product.quantity}
              </span>
            </div>
          </div>

          <AddToCartButton
            productSlug={product.slug}
            disabled={product.stock <= 0}
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}
