import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { articles } from '../data/articles';
import ArticleCard from './ArticleCard';

export default function HomeArticles() {
  return (
    <section id="articles" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted text-sm font-bold">دانش مکمل‌ها</p>
          <h2 className="text-foreground mt-2 text-2xl font-black sm:text-[28px]">
            مقاله‌ها و راهنماها
          </h2>
        </div>
        <Link
          href="/blog"
          className="text-foreground hover:text-accent-strong inline-flex min-h-10 items-center gap-2 text-sm font-bold transition-colors"
        >
          همهٔ مقاله‌ها
          <FiArrowLeft size={16} aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
