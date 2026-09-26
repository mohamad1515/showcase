'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiLoader, FiSearch, FiX } from 'react-icons/fi';
import { getProducts } from '../lib/graphql';
import type { Product } from '../lib/products';

export default function SearchBox() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all products on first render
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load products:', error);
        setIsInitialized(true);
      }
    };

    loadProducts();
  }, []);

  // Handle search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);

      try {
        const searchQuery = query.toLowerCase();

        const filtered = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery) ||
            product.tagline?.toLowerCase().includes(searchQuery) ||
            product.summary?.toLowerCase().includes(searchQuery),
        );

        setResults(filtered.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);

    return () => clearTimeout(timer);
  }, [query, allProducts]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const closeDropdown = () => {
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-full">
      {/* Search Input */}
      <div className="border-border focus-within:border-accent focus-within:ring-accent-soft relative flex h-12 items-center rounded-full border bg-[#f4f4f4] px-3 transition-colors focus-within:ring-2">
        <FiSearch className="text-muted absolute left-3 shrink-0" size={16} aria-hidden />

        <input
          ref={inputRef}
          type="text"
          placeholder="جستجو ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="text-foreground h-full w-full border-0 bg-transparent pr-3 pl-9 text-right text-sm ring-0 outline-none placeholder:text-right placeholder:text-xs focus:border-0 focus:ring-0 focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none"
          dir="rtl"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="پاک کردن جستجو"
            className="text-muted hover:text-foreground absolute left-9 shrink-0 border-0 bg-transparent p-0 ring-0 transition-colors outline-none focus:ring-0 focus:outline-none"
          >
            <FiX size={15} />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isFocused && (
        <div className="bg-surface absolute top-full right-0 z-50 mt-2 w-full min-w-60 rounded-md border-0 shadow-lg">
          {!isInitialized ? (
            <div className="text-muted p-4 text-center text-sm">درحال بارگیری...</div>
          ) : !query.trim() ? (
            <div className="text-muted p-4 text-center text-xs">جستجو در همه محصولات</div>
          ) : loading ? (
            <div className="text-muted flex items-center justify-center gap-2 p-4 text-sm">
              <FiLoader className="animate-spin" size={14} aria-hidden />
              درحال جستجو...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-96 space-y-1 overflow-y-auto p-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={closeDropdown}
                    className="hover:border-border hover:bg-background block rounded-md border border-transparent p-3 transition-colors"
                  >
                    <div className="text-foreground text-sm font-bold">{product.name}</div>

                    <div className="text-muted line-clamp-1 text-xs">{product.tagline}</div>

                    <div className="text-accent mt-1 text-sm font-black">
                      {product.price}

                      <span className="text-muted mr-1 text-[10px] font-bold">تومان</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-border border-t">
                <Link
                  href="/products"
                  onClick={closeDropdown}
                  className="text-accent hover:text-foreground block p-3 text-center text-sm font-bold transition-colors"
                >
                  مشاهده تمام محصولات
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-muted p-4 text-center text-sm">محصولی با این عنوان پیدا نشد</div>

              <div className="border-border border-t">
                <Link
                  href="/products"
                  onClick={closeDropdown}
                  className="text-accent hover:text-foreground block p-3 text-center text-sm font-bold transition-colors"
                >
                  مشاهده تمام محصولات
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
