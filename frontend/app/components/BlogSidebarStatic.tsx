import Image from 'next/image';
import Link from 'next/link';
import { articles } from '../data/articles';

export default function BlogSidebarStatic() {
  const categories = new Map<string, number>();
  for (const article of articles) {
    categories.set(article.category, (categories.get(article.category) ?? 0) + 1);
  }

  return (
    <aside className="space-y-8">
      <div className="border-border bg-card rounded-md border p-5">
        <h3 className="text-foreground text-sm font-black">دسته‌بندی‌ها</h3>
        <ul className="mt-3 space-y-2">
          {[...categories.entries()].map(([name, count]) => (
            <li key={name} className="text-foreground flex items-center justify-between text-sm font-bold">
              {name}
              <span className="text-muted text-xs">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-border bg-card rounded-md border p-5">
        <h3 className="text-foreground text-sm font-black">همهٔ مقاله‌ها</h3>
        <ul className="mt-4 space-y-4">
          {articles.map((post) => (
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
