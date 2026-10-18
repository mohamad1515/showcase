import Image from 'next/image';
import Link from 'next/link';
import { articles } from '../data/articles';

export default function RelatedArticles({ excludeSlug }: { excludeSlug: string }) {
  const current = articles.find((article) => article.slug === excludeSlug);
  const related = articles
    .filter(
      (article) =>
        article.slug !== excludeSlug && (!current || article.category === current.category),
    )
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-foreground text-lg font-black">مطالب مرتبط</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group flex items-center gap-4"
          >
            <span className="bg-surface-1 relative h-20 w-28 shrink-0 overflow-hidden rounded-md">
              <Image src={article.image} alt="" fill sizes="112px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="text-muted block text-xs font-bold">{article.readingTime} مطالعه</span>
              <span className="text-foreground group-hover:text-accent-strong line-clamp-2 block text-sm font-black transition-colors">
                {article.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
