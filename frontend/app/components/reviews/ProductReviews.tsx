"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { getProductReviews, voteComment } from "../../lib/graphql";
import type {
  ProductReviews as ProductReviewsData,
  VoteType,
} from "../../lib/products";
import { errorMessage, notifyError, notifyInfo } from "../../lib/toast";
import { useAuth } from "../../providers/AuthProvider";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";
import StarRating from "./StarRating";

function Summary({ data }: { data: ProductReviewsData }) {
  return (
    <div className="mt-6 grid gap-6 border-b border-border pb-6 sm:grid-cols-[12rem_1fr] sm:items-center">
      <div className="text-center">
        <p className="text-5xl font-black tabular-nums text-foreground">
          {data.average.toFixed(1)}
        </p>
        <StarRating value={data.average} size="md" className="mt-2" />
        <p className="mt-1.5 text-xs text-muted">
          بر اساس {data.count} نظر
        </p>
      </div>

      <ul className="space-y-2" aria-label="توزیع امتیازها">
        {[5, 4, 3, 2, 1].map((star) => {
          const total = data.distribution[star - 1] ?? 0;
          const percent = data.count ? (total / data.count) * 100 : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-xs">
              <span className="flex w-8 shrink-0 items-center gap-1 font-bold tabular-nums text-foreground">
                {star}
                <FiStar
                  aria-hidden
                  className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                <span
                  className="block h-full rounded-full bg-yellow-400"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-end tabular-nums text-muted">
                {total}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div
      className="mt-6 space-y-3"
      aria-busy="true"
      aria-label="در حال بارگذاری نظرات"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-lg bg-background"
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [data, setData] = useState<ProductReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await getProductReviews(productSlug));
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err, "دریافت نظرات ناموفق بود."));
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  // Wait for the stored session so the request carries the token and returns myVote.
  // `token` is a dependency so the list reloads when the user signs in or out.
  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, token, load]);

  async function handleVote(commentId: string, type: VoteType) {
    if (!token) {
      notifyInfo("برای رأی دادن ابتدا وارد حساب کاربری شوید.");
      return;
    }
    try {
      const updated = await voteComment(commentId, type);
      setData(
        (current) =>
          current && {
            ...current,
            comments: current.comments.map((comment) =>
              comment.id === updated.id ? updated : comment,
            ),
          },
      );
    } catch (err) {
      notifyError(errorMessage(err, "ثبت رأی ناموفق بود."));
    }
  }

  function handleCreated() {
    void load();
    // Re-render the server-side rating shown in the product header.
    router.refresh();
  }

  return (
    <section
      id="reviews"
      className="mt-10 scroll-mt-24 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-black text-foreground">نظرات کاربران</h2>

      {loading || authLoading ? (
        <ReviewsSkeleton />
      ) : loadError && !data ? (
        <div
          role="alert"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void load();
            }}
            className="rounded-md border border-danger px-3 py-1.5 font-bold transition hover:bg-danger hover:text-background"
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        data && (
          <>
            {data.count > 0 && <Summary data={data} />}

            <div className="mt-6 border-b border-border pb-6">
              {token ? (
                <ReviewForm
                  productSlug={productSlug}
                  onCreated={handleCreated}
                />
              ) : (
                <p className="rounded-lg border border-border bg-background p-4 text-sm leading-7 text-muted">
                  برای ثبت نظر ابتدا{" "}
                  <Link
                    href="/auth/login"
                    className="font-bold text-accent hover:underline"
                  >
                    وارد حساب کاربری شوید
                  </Link>{" "}
                  یا{" "}
                  <Link
                    href="/auth/register"
                    className="font-bold text-accent hover:underline"
                  >
                    ثبت‌نام کنید
                  </Link>
                  .
                </p>
              )}
            </div>

            {data.comments.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
                <FiStar
                  aria-hidden
                  className="mx-auto h-8 w-8 text-muted/60"
                />
                <p className="mt-3 text-sm leading-7 text-muted">
                  هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که
                  نظر خود را به اشتراک می‌گذارد.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {data.comments.map((comment) => (
                  <ReviewItem
                    key={comment.id}
                    comment={comment}
                    onVote={(type) => handleVote(comment.id, type)}
                  />
                ))}
              </div>
            )}
          </>
        )
      )}
    </section>
  );
}
