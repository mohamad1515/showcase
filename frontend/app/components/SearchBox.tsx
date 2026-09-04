"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiLoader, FiSearch, FiX } from "react-icons/fi";
import { getProducts } from "../lib/graphql";
import type { Product } from "../lib/products";

export default function SearchBox() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
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
        console.error("Failed to load products:", error);
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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const closeDropdown = () => {
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      {/* Search Input */}
      <div className="flex h-10 items-center gap-2 rounded-2xl border border-border bg-background px-3 transition-colors">
        <FiSearch className="shrink-0 text-muted" size={16} aria-hidden />

        <input
          ref={inputRef}
          type="text"
          placeholder="جستجو ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="
            h-full
            w-full
            border-0
            bg-transparent
            text-sm
            text-foreground
            outline-none
            ring-0
            focus:border-0
            focus:outline-none
            focus:ring-0
            focus-visible:border-0
            focus-visible:outline-none
            focus-visible:ring-0
            placeholder:text-xs
          "
          dir="rtl"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="پاک کردن جستجو"
            className="
              shrink-0
              border-0
              bg-transparent
              p-0
              text-muted
              outline-none
              ring-0
              transition-colors
              hover:text-foreground
              focus:outline-none
              focus:ring-0
            "
          >
            <FiX size={15} />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isFocused && (
        <div className="absolute top-full right-0 z-50 mt-2 border-0 w-full min-w-60 rounded-md bg-surface shadow-lg">
          {!isInitialized ? (
            <div className="p-4 text-center text-sm text-muted">
              درحال بارگیری...
            </div>
          ) : !query.trim() ? (
            <div className="p-4 text-center text-xs text-muted">
              جستجو در همه محصولات
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted">
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
                    className="
                      block
                      rounded-md
                      border
                      border-transparent
                      p-3
                      transition-colors
                      hover:border-border
                      hover:bg-background
                    "
                  >
                    <div className="text-sm font-bold text-foreground">
                      {product.name}
                    </div>

                    <div className="line-clamp-1 text-xs text-muted">
                      {product.tagline}
                    </div>

                    <div className="mt-1 text-sm font-black text-accent">
                      {product.price}

                      <span className="mr-1 text-[10px] font-bold text-muted">
                        تومان
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t border-border">
                <Link
                  href="/products"
                  onClick={closeDropdown}
                  className="
                    block
                    p-3
                    text-center
                    text-sm
                    font-bold
                    text-accent
                    transition-colors
                    hover:text-foreground
                  "
                >
                  مشاهده تمام محصولات
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 text-center text-sm text-muted">
                محصولی با این عنوان پیدا نشد
              </div>

              <div className="border-t border-border">
                <Link
                  href="/products"
                  onClick={closeDropdown}
                  className="
                    block
                    p-3
                    text-center
                    text-sm
                    font-bold
                    text-accent
                    transition-colors
                    hover:text-foreground
                  "
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
