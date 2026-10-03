import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '../data/articles';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group min-w-0">
      <Link
        href={`/blog/${article.slug}`}
        className="bg-surface-1 block overflow-hidden rounded-md"
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <p className="text-muted mt-4 text-xs font-bold">
        {article.category} · {article.readingTime} مطالعه
      </p>
      <h3 className="text-foreground mt-2 text-lg leading-7 font-black">
        <Link href={`/blog/${article.slug}`} className="hover:text-accent-strong transition-colors">
          {article.title}
        </Link>
      </h3>
      <p className="text-muted mt-2 text-sm leading-6">{article.excerpt}</p>
    </article>
  );
}
