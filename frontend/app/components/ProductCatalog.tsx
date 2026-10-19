'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../lib/products';
import Pagination from './ui/Pagination';
import PriceRangeSlider from './ui/PriceRangeSlider';
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
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const priceBounds = useMemo(() => {
    const prices = products.map((product) => numericPrice(product.price));
    return {
      min: 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  const categories = useMemo(
    () =>
      categoryOptions ??
      [...new Set(products.map((product) => product.category).filter(Boolean))]
        .sort()
        .map((value) => ({ value, label: value })),
    [categoryOptions, products],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (availability && product.stock <= 0) return false;
      const price = numericPrice(product.price);
      if (price < priceRange[0] || price > priceRange[1]) return false;
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
  }, [availability, category, priceRange, products, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function resetFilters() {
    setCategory('all');
    setAvailability(false);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSort('newest');
    setPage(1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
      <aside
        className="border-border bg-card h-fit space-y-6 rounded-md border p-4 sm:p-5"
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

        <div>
          <h3 className="text-foreground mb-3 text-sm font-black">فیلتر بر اساس قیمت</h3>
          {priceBounds.max > 0 && (
            <PriceRangeSlider
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceRange}
              onChange={(value) => {
                setPriceRange(value);
                setPage(1);
              }}
            />
          )}
        </div>

        <div>
          <h3 className="text-foreground mb-3 text-sm font-black">دسته‌بندی‌ها</h3>
          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  setCategory('all');
                  setPage(1);
                }}
                className={
                  category === 'all'
                    ? 'text-accent-strong flex w-full items-center justify-between text-sm font-black'
                    : 'text-foreground hover:text-accent-strong flex w-full items-center justify-between text-sm font-bold transition-colors'
                }
              >
                همهٔ دسته‌ها
                <span className="text-muted text-xs">{products.length}</span>
              </button>
            </li>
            {categories.map((item) => (
              <li key={item.value}>
                <button
                  type="button"
                  onClick={() => {
                    setCategory(item.value);
                    setPage(1);
                  }}
                  className={
                    category === item.value
                      ? 'text-accent-strong flex w-full items-center justify-between text-sm font-black'
                      : 'text-foreground hover:text-accent-strong flex w-full items-center justify-between text-sm font-bold transition-colors'
                  }
                >
                  {item.label}
                  <span className="text-muted text-xs">{categoryCounts.get(item.value) ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <label className="text-foreground flex min-h-10 items-center gap-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={availability}
            onChange={(event) => {
              setAvailability(event.target.checked);
              setPage(1);
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
                setPage(1);
              }}
              className="border-border bg-surface h-10 max-w-[190px] rounded-md border px-3 text-sm font-normal"
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
            <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
          </>
        ) : (
          <div className="border-border-strong rounded-md border border-dashed px-5 py-12 text-center">
            <h2 className="text-foreground text-lg font-black">محصولی پیدا نشد</h2>
            <p className="text-muted mt-2 text-sm">فیلترها را تغییر بده یا دوباره پاک کن.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-accent text-black mt-5 min-h-10 rounded-md px-4 text-sm font-bold"
            >
              پاک‌کردن فیلترها
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
