'use client';

import { useMemo, useState } from 'react';
import type { Product } from '../lib/products';
import ProductCard from './ProductCard';

const PAGE_SIZE = 12;

type CategoryOption = { value: string; label: string };

function numericPrice(value: string) {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^\d]/g, '');
  return Number(normalized) || 0;
}

export default function ProductCatalog({
  products,
  initialCategory = 'all',
  categoryOptions,
}: {
  products: Product[];
  initialCategory?: string;
  categoryOptions?: CategoryOption[];
}) {
  const [category, setCategory] = useState(initialCategory);
  const [availability, setAvailability] = useState(false);
  const [maximumPrice, setMaximumPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(
    () =>
      categoryOptions ??
      [...new Set(products.map((product) => product.category).filter(Boolean))]
        .sort()
        .map((value) => ({ value, label: value })),
    [categoryOptions, products],
  );

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (availability && product.stock <= 0) return false;
      if (maximumPrice && numericPrice(product.price) > Number(maximumPrice)) return false;
      return true;
    });

    return filtered.sort((left, right) => {
      if (sort === 'rating') {
        return right.rating - left.rating || right.reviewCount - left.reviewCount;
      }
      if (sort === 'price-asc') return numericPrice(left.price) - numericPrice(right.price);
      if (sort === 'price-desc') return numericPrice(right.price) - numericPrice(left.price);
      const leftDate = left.createdAt ? Date.parse(left.createdAt) : 0;
      const rightDate = right.createdAt ? Date.parse(right.createdAt) : 0;
      return rightDate - leftDate;
    });
  }, [availability, category, maximumPrice, products, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  function resetFilters() {
    setCategory('all');
    setAvailability(false);
    setMaximumPrice('');
    setSort('newest');
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
      <aside
        className="border-border bg-card h-fit rounded-md border p-4 sm:p-5"
        aria-label="فیلتر محصولات"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground text-base font-black">فیلترها</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-muted hover:text-foreground text-xs font-bold underline-offset-4 hover:underline"
          >
            پاک‌کردن
          </button>
        </div>

        <label className="text-foreground mt-5 grid gap-2 text-sm font-bold">
          دسته‌بندی
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="border-border h-11 w-full rounded-md border bg-white px-3 text-sm font-normal"
          >
            <option value="all">همهٔ دسته‌ها</option>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-foreground mt-5 grid gap-2 text-sm font-bold">
          حداکثر قیمت (تومان)
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={maximumPrice}
            onChange={(event) => {
              setMaximumPrice(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="بدون محدودیت"
            className="border-border h-11 w-full rounded-md border bg-white px-3 text-sm font-normal"
          />
        </label>

        <label className="text-foreground mt-5 flex min-h-11 items-center gap-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={availability}
            onChange={(event) => {
              setAvailability(event.target.checked);
              setVisibleCount(PAGE_SIZE);
            }}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          فقط کالاهای موجود
        </label>
      </aside>

      <section aria-label="فهرست محصولات" className="min-w-0">
        <div className="border-border mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <p className="text-muted text-sm" aria-live="polite">
            {filteredProducts.length} محصول
          </p>
          <label className="text-foreground flex items-center gap-2 text-sm font-bold">
            مرتب‌سازی
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="border-border h-10 max-w-[190px] rounded-md border bg-white px-3 text-sm font-normal"
            >
              <option value="newest">جدیدترین</option>
              <option value="rating">بالاترین امتیاز</option>
              <option value="price-asc">ارزان‌ترین</option>
              <option value="price-desc">گران‌ترین</option>
            </select>
          </label>
        </div>

        {visibleProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
            {visibleCount < filteredProducts.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="border-border text-foreground hover:border-accent hover:bg-accent min-h-11 rounded-md border px-5 text-sm font-bold transition-colors"
                >
                  نمایش محصولات بیشتر
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="border-border-strong rounded-md border border-dashed px-5 py-12 text-center">
            <h2 className="text-foreground text-lg font-black">محصولی پیدا نشد</h2>
            <p className="text-muted mt-2 text-sm">فیلترها را تغییر بده یا دوباره پاک کن.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-accent text-foreground mt-5 min-h-10 rounded-md px-4 text-sm font-bold"
            >
              پاک‌کردن فیلترها
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
