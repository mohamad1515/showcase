"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";
import { getProducts } from "../lib/graphql";
import type { Product } from "../lib/products";

export default function SearchBox() {
  const [isOpen, setIsOpen] = useState(false);
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
        // Filter products based on query
        const filtered = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.tagline?.toLowerCase().includes(query.toLowerCase()) ||
            product.summary?.toLowerCase().includes(query.toLowerCase()),
        );
        setResults(filtered.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query, allProducts]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      {!isOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          title="جست‌وجو"
          aria-label="جست‌وجو"
          className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <FiSearch size={18} aria-hidden />
        </button>
      ) : (
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 bg-surface border border-border rounded px-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="جستجو..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-full bg-transparent outline-none text-sm text-foreground placeholder-muted"
            dir="rtl"
          />
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="بستن"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full min-w-60 max-w-sm bg-surface border border-border rounded shadow-lg z-50">
          {!isInitialized ? (
            <div className="p-4 text-center text-muted text-sm">
              درحال بارگیری...
            </div>
          ) : query.trim() ? (
            <>
              {loading ? (
                <div className="p-4 text-center text-muted text-sm">
                  درحال جستجو...
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="space-y-1 p-2 max-h-96 overflow-y-auto">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={handleClose}
                        className="block p-3 rounded hover:bg-[#3a3a3a] transition-colors border border-transparent hover:border-border"
                      >
                        <div className="font-semibold text-sm text-foreground">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted line-clamp-1">
                          {product.tagline}
                        </div>
                        <div className="text-sm font-semibold text-[var(--brand)] mt-1">
                          {product.price}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border">
                    <Link
                      href="/products"
                      onClick={handleClose}
                      className="block p-3 text-center text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
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
                      onClick={handleClose}
                      className="block p-3 text-center text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
                    >
                      مشاهده تمام محصولات
                    </Link>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-muted text-sm">
              برای جستجو کلماتی را وارد کنید
            </div>
          )}
        </div>
      )}
    </div>
  );
}
