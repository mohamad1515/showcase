'use client';

import { useMemo, useState } from 'react';
import { articles } from '../data/articles';
import ArticleCard from './ArticleCard';
import BlogSidebar from './BlogSidebar';

export default function BlogListing() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (category !== 'all' && article.category !== category) return false;
      if (search.trim().length === 0) return true;
      const query = search.trim().toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query)
      );
    });
  }, [search, category]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section aria-label="فهرست مقاله‌ها">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            {filtered.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border-border-strong rounded-md border border-dashed px-5 py-12 text-center">
            <h2 className="text-foreground text-lg font-black">مقاله‌ای پیدا نشد</h2>
            <p className="text-muted mt-2 text-sm">عبارت جستجو یا دسته‌بندی را تغییر بده.</p>
          </div>
        )}
      </section>

      <BlogSidebar
        search={search}
        onSearchChange={setSearch}
        activeCategory={category}
        onCategoryChange={setCategory}
      />
    </div>
  );
}
