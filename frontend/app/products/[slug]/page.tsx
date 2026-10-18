import { notFound } from "next/navigation";
import { FiCheck, FiInfo } from "react-icons/fi";

import ProductImageGallery from "../../components/ProductImageGallery";
import ProductPurchaseRow from "../../components/ProductPurchaseRow";
import ProductReviews from "../../components/reviews/ProductReviews";
import RelatedProducts from "../../components/RelatedProducts";
import StarRating from "../../components/reviews/StarRating";
import Tabs from "../../components/ui/Tabs";
import { getProductBySlug, getProducts } from "../../lib/graphql";
import type { Product } from "../../lib/products";

// Product data is fetched with `cache: "no-store"` (live price, stock and rating), so
// the page is rendered per request. Declaring it dynamic also avoids the production
// 500 (DYNAMIC_SERVER_USAGE) that `generateStaticParams` caused for on-demand slugs.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// `name` is computed by the backend from `persianName`; fall back to it so the
// title, heading and image alt text can never render as "undefined".
const productTitle = (product: Product) =>
  product.name || product.persianName || "محصول";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "محصول پیدا نشد" };
  }

  return {
    title: `${productTitle(product)} | فیت مکمل`,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);
  if (!product) notFound();

  const siblingProducts = allProducts.filter(
    (candidate) => candidate.category === product.category,
  );

  const typeLabel =
    product.productType === "powder"
      ? "پودر"
      : product.productType === "liquid"
        ? "مایع"
        : product.productType === "tablet"
          ? "قرص"
          : "کپسول";

  // Rows for the spec panel, styled after a supplement facts label —
  // the format people scanning a supplement product already trust.
  const specRows = [
    { label: "وزن", value: product.weight },
    { label: "مقدار", value: product.quantity },
    { label: "نوع محصول", value: typeLabel },
  ];

  const inStock = product.stock > 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-8">
          <ProductImageGallery
            images={product.images}
            productName={productTitle(product)}
          />
        </div>

        {/* Info column */}
        <div className="space-y-7">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
              {productTitle(product)}
            </h1>
            <span className="mt-1 shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted">
              {typeLabel}
            </span>
          </div>

          <a
            href="#reviews"
            className="flex w-fit items-center gap-2 text-sm transition hover:opacity-80"
          >
            <StarRating value={product.rating} size="sm" />
            {product.reviewCount > 0 ? (
              <>
                <span className="font-bold tabular-nums text-foreground">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-muted">({product.reviewCount} نظر)</span>
              </>
            ) : (
              <span className="text-muted">هنوز نظری ثبت نشده</span>
            )}
          </a>

          <p className="max-w-[62ch] text-base leading-8 text-foreground/90">
            {product.description}
          </p>

          {/* Price + stock */}
          <div className="flex items-end justify-between gap-4 border-y border-border py-5">
            <div>
              <p className="text-xs font-bold text-muted">قیمت</p>
              <p className="mt-1 text-3xl font-black tabular-nums text-foreground">
                {product.price}
                <span className="mr-1.5 text-sm font-bold text-muted">
                  تومان
                </span>
              </p>
            </div>
            <span
              className={
                inStock
                  ? "rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent"
                  : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500"
              }
            >
              {inStock ? "موجود در انبار" : "ناموجود"}
            </span>
          </div>

          <ProductPurchaseRow productSlug={product.slug} inStock={inStock} />
        </div>
      </section>

      <section className="mt-12">
        <Tabs
          defaultTabId="description"
          items={[
            {
              id: "description",
              label: "توضیحات",
              content: (
                <article className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
                  <h2 className="text-xl font-black text-foreground">ویژگی‌های اصلی</h2>
                  <p className="mt-4 max-w-[62ch] text-sm leading-8 text-muted">
                    {product.description}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
                      >
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-background">
                          <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <p className="text-sm leading-7 text-foreground">{feature}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ),
            },
            {
              id: "specs",
              label: "مشخصات",
              content: (
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="border-2 border-foreground text-foreground">
                    <div className="border-b-2 border-foreground px-4 py-2.5">
                      <span className="text-sm font-black">مشخصات محصول</span>
                    </div>
                    <div>
                      {specRows.map((row, index) => (
                        <div
                          key={row.label}
                          className={
                            index !== specRows.length - 1
                              ? "flex items-center justify-between border-b border-foreground/25 px-4 py-2.5"
                              : "flex items-center justify-between px-4 py-2.5"
                          }
                        >
                          <span className="text-sm font-bold text-muted">{row.label}</span>
                          <span className="text-sm font-black tabular-nums">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <aside className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FiInfo className="h-5 w-5 text-accent" aria-hidden />
                      <h2 className="text-lg font-black text-foreground">نکته مصرف</h2>
                    </div>
                    <p className="mt-4 text-sm leading-8 text-muted">
                      مقدار و زمان مصرف مکمل‌ها به هدف تمرینی، وضعیت سلامت و رژیم غذایی
                      بستگی دارد. قبل از مصرف منظم، برچسب محصول و نظر متخصص را در نظر
                      بگیرید.
                    </p>
                  </aside>
                </div>
              ),
            },
            {
              id: "reviews",
              label: `نظرات (${product.reviewCount})`,
              content: <ProductReviews productSlug={product.slug} />,
            },
          ]}
        />
      </section>

      <RelatedProducts products={siblingProducts} excludeSlug={product.slug} />
    </main>
  );
}
