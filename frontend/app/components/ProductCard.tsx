"use client";

import Image from "next/image";
import Link from "next/link";
import { FiBox, FiPackage } from "react-icons/fi";
import type { Product, ProductCategory } from "../lib/products";

const categoryLabels: Record<ProductCategory, string> = {
  default: "پیشنهادی",
  popular: "محبوب",
  "best-selling": "پرفروش",
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_45px_-25px_rgba(14,168,148,0.55)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        <Image
          src={product.images?.[0] ?? "/images/product.png"}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <span className="absolute right-3 top-3 rounded-md bg-surface/95 px-3 py-1 text-xs font-bold text-accent shadow-sm ring-1 ring-border">
          {categoryLabels[product.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-black leading-6 text-foreground transition group-hover:text-accent">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted">
            {product.tagline}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="tabular-fa text-base font-black text-gold">
            {product.price}
            <span className="mr-1 text-xs font-bold text-muted">تومان</span>
          </span>

          <div className="flex items-center gap-3 text-xs font-bold text-muted">
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
      </div>
    </Link>
  );
}
