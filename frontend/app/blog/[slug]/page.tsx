import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import { articles } from '../../data/articles';

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  return article ? { title: `${article.title} | فیت مکمل`, description: article.excerpt } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
      <Link
        href="/blog"
        className="text-muted hover:text-foreground inline-flex min-h-10 items-center gap-2 text-sm font-bold transition-colors"
      >
        <FiArrowRight size={16} aria-hidden />
        بازگشت به مقاله‌ها
      </Link>
      <article className="mt-6">
        <p className="text-muted text-sm font-bold">
          {article.category} · {article.readingTime} مطالعه
        </p>
        <h1 className="text-foreground mt-3 text-3xl leading-tight font-black sm:text-4xl">
          {article.title}
        </h1>
        <p className="text-muted mt-4 text-base leading-8">{article.excerpt}</p>
        <div className="bg-surface-1 relative mt-8 aspect-[16/9] overflow-hidden rounded-md">
          <Image
            src={article.image}
            alt=""
            fill
            priority
            sizes="(min-width: 900px) 900px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="mt-8 space-y-7">
          {article.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-foreground text-xl font-black">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted text-base leading-8">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
