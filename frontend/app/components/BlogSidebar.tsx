'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import { articles } from '../data/articles';

export default function BlogSidebar({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategory: string;
  onCategoryChange: (value: string) => void;
}) {
  const categories = new Map<string, number>();
  for (const article of articles) {
    categories.set(article.category, (categories.get(article.category) ?? 0) + 1);
  }
  const recentPosts = articles.slice(0, 3);

  return (
    <aside className="space-y-8">
      <div className="border-border bg-card rounded-md border p-5">
        <h3 className="text-foreground text-sm font-black">جستجو</h3>
        <div className="border-border mt-3 flex h-11 items-center gap-2 rounded-md border px-3">
          <FiSearch className="text-muted" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="جستجوی مقاله..."
            className="text-foreground h-full w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="border-border bg-card rounded-md border p-5">
        <h3 className="text-foreground text-sm font-black">دسته‌بندی‌ها</h3>
        <ul className="mt-3 space-y-2">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={
                activeCategory === 'all'
                  ? 'text-accent-strong flex w-full items-center justify-between text-sm font-black'
                  : 'text-foreground hover:text-accent-strong flex w-full items-center justify-between text-sm font-bold transition-colors'
              }
            >
              همه
              <span className="text-muted text-xs">{articles.length}</span>
            </button>
          </li>
          {[...categories.entries()].map(([name, count]) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onCategoryChange(name)}
                className={
                  activeCategory === name
                    ? 'text-accent-strong flex w-full items-center justify-between text-sm font-black'
                    : 'text-foreground hover:text-accent-strong flex w-full items-center justify-between text-sm font-bold transition-colors'
                }
              >
                {name}
                <span className="text-muted text-xs">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-border bg-card rounded-md border p-5">
        <h3 className="text-foreground text-sm font-black">مطالب محبوب</h3>
        <ul className="mt-4 space-y-4">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group flex items-center gap-3">
                <span className="bg-surface-1 relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                  <Image src={post.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="text-foreground group-hover:text-accent-strong line-clamp-2 block text-sm font-bold transition-colors">
                    {post.title}
                  </span>
                  <span className="text-muted block text-xs">{post.readingTime} مطالعه</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
