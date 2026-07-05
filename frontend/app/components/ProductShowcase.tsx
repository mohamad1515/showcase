"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowLeft, FiGrid, FiStar, FiTrendingUp } from "react-icons/fi";
import type { Product, ProductCategory } from "../lib/products";
import ProductCard from "./ProductCard";

const filters: {
  label: string;
  value: ProductCategory;
  icon: React.ElementType;
}[] = [
  { label: "همه", value: "default", icon: FiGrid },
  { label: "محبوب", value: "popular", icon: FiStar },
  { label: "پرفروش", value: "best-selling", icon: FiTrendingUp },
];

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
          <p className="h-eyebrow">محصولات مکمل</p>
          <h2 className="h-display mt-2 text-2xl text-foreground sm:text-3xl">
            مکمل مناسب هدفت را سریع پیدا کن
          </h2>
        </div>

        <div className="flex rounded-md border border-border bg-surface p-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`flex h-10 items-center gap-2 rounded px-4 text-sm font-bold transition ${
                activeFilter === filter.value
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <filter.icon aria-hidden />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/products"
          className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
        >
          مشاهده محصولات بیشتر
          <FiArrowLeft aria-hidden />
        </Link>
      </div>
    </section>
  );
}
