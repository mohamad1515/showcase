import ArticleCard from '../components/ArticleCard';
import { articles } from '../data/articles';

export const metadata = {
  title: 'مقاله‌ها و راهنماها | فیت مکمل',
  description: 'راهنماهایی برای شناخت ترکیبات و بررسی مکمل‌های ورزشی.',
};

export default function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6" dir="rtl">
      <header className="border-border mb-8 border-b pb-6 sm:mb-10">
        <p className="text-muted text-sm font-bold">فیت مکمل</p>
        <h1 className="text-foreground mt-2 text-3xl font-black">مقاله‌ها و راهنماها</h1>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
