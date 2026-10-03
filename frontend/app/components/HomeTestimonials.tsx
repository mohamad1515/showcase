import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import type { Comment } from '../lib/products';
import StarRating from './reviews/StarRating';

export default function HomeTestimonials({ reviews }: { reviews: Comment[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg bg-[var(--color-footer)] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white/65">از تجربهٔ خریداران</p>
          <h2 className="mt-2 text-2xl font-black sm:text-[28px]">نظر مشتریان</h2>
        </div>
        <Link
          href="/products"
          className="hover:text-accent inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white transition-colors"
        >
          دیدن محصولات و نظرها
          <FiArrowLeft size={16} aria-hidden />
        </Link>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <article key={review.id} className="rounded-md border border-white/15 bg-white/5 p-5">
            <StarRating value={review.rating} size="sm" />
            <blockquote className="mt-4 line-clamp-4 text-sm leading-7 text-white/85">
              «{review.content}»
            </blockquote>
            <p className="mt-4 text-xs font-bold text-white/60">
              {review.userName} · {review.productName}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
