"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, ProductCategory } from "../lib/products";

const filters: { label: string; value: ProductCategory }[] = [
  { label: "همه", value: "default" },
  { label: "محبوب", value: "popular" },
  { label: "پرفروش", value: "best-selling" },
];

const categoryLabels: Record<ProductCategory, string> = {
  default: "پیشنهادی",
  popular: "محبوب",
  "best-selling": "پرفروش",
};

function orderProducts(products: Product[], filter: ProductCategory) {
  if (filter === "default") return products;

  const selected = products.filter((product) => product.category === filter);
  const remaining = products.filter((product) => product.category !== filter);
  return [...selected, ...remaining];
}

export default function ProductShowcase({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState<ProductCategory>("default");
  const visibleProducts = useMemo(
    () => orderProducts(products, activeFilter).slice(0, 9),
    [activeFilter, products],
  );

  return (
    <section id="products" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-accent">محصولات مکمل</p>
          <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
            مکمل مناسب هدفت را سریع پیدا کن
          </h2>
        </div>

        <div className="flex rounded-md border border-border bg-surface p-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`h-10 rounded px-4 text-sm font-bold transition ${
                activeFilter === filter.value
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <article
            key={product.slug}
            className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
          >
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <Image
                  src={product.images?.[0] ?? "/images/product.png"}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute right-3 top-3 rounded-md bg-background/90 px-3 py-1 text-xs font-bold text-accent shadow-sm">
                  {categoryLabels[product.category]}
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-xl font-black text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-muted">
                    {product.tagline}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="text-sm font-black text-accent">
                    {product.price} تومان
                  </span>
                  <span className="text-xs font-bold text-muted">
                    وزن: {product.weight} · تعداد: {product.quantity}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
        >
          مشاهده محصولات بیشتر
        </Link>
      </div>
    </section>
  );
}
