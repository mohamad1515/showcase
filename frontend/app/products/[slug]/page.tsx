import { notFound } from 'next/navigation';
import { FiCheck, FiInfo } from 'react-icons/fi';

import ProductImageGallery from '../../components/ProductImageGallery';
import ProductPurchaseRow from '../../components/ProductPurchaseRow';
import ProductReviews from '../../components/reviews/ProductReviews';
import RelatedProducts from '../../components/RelatedProducts';
import StarRating from '../../components/reviews/StarRating';
import Tabs from '../../components/ui/Tabs';
import { getProductBySlug, getProducts } from '../../lib/graphql';
import type { Product } from '../../lib/products';

// Product data is fetched with `cache: "no-store"` (live price, stock and rating), so
// the page is rendered per request. Declaring it dynamic also avoids the production
// 500 (DYNAMIC_SERVER_USAGE) that `generateStaticParams` caused for on-demand slugs.
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// `name` is computed by the backend from `persianName`; fall back to it so the
// title, heading and image alt text can never render as "undefined".
const productTitle = (product: Product) => product.name || product.persianName || 'محصول';

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'محصول پیدا نشد' };
  }

  return {
    title: `${productTitle(product)} | فیت مکمل`,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();

  const siblingProducts = allProducts.filter(
    (candidate) => candidate.category === product.category,
  );

  const typeLabel =
    product.productType === 'powder'
      ? 'پودر'
      : product.productType === 'liquid'
        ? 'مایع'
        : product.productType === 'tablet'
          ? 'قرص'
          : 'کپسول';

  // Rows for the spec panel, styled after a supplement facts label —
  // the format people scanning a supplement product already trust.
  const specRows = [
    { label: 'وزن', value: product.weight },
    { label: 'مقدار', value: product.quantity },
    { label: 'نوع محصول', value: typeLabel },
  ];

  const inStock = product.stock > 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-8">
          <ProductImageGallery images={product.images} productName={productTitle(product)} />
        </div>

        {/* Info column */}
        <div className="space-y-7">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-foreground text-3xl leading-tight font-black tracking-tight sm:text-4xl">
              {productTitle(product)}
            </h1>
            <span className="border-border bg-background text-muted mt-1 shrink-0 rounded-full border px-3 py-1 text-xs font-bold">
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
                <span className="text-foreground font-bold tabular-nums">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-muted">({product.reviewCount} نظر)</span>
              </>
            ) : (
              <span className="text-muted">هنوز نظری ثبت نشده</span>
            )}
          </a>

          <p className="text-foreground/90 max-w-[62ch] text-base leading-8">
            {product.description}
          </p>

          {/* Price + stock */}
          <div className="border-border flex items-end justify-between gap-4 border-y py-5">
            <div>
              <p className="text-muted text-xs font-bold">قیمت</p>
              <p className="text-foreground mt-1 text-3xl font-black tabular-nums">
                {product.price}
                <span className="text-muted mr-1.5 text-sm font-bold">تومان</span>
              </p>
            </div>
            <span
              className={
                inStock
                  ? 'bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-bold'
                  : 'rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500'
              }
            >
              {inStock ? 'موجود در انبار' : 'ناموجود'}
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
              id: 'description',
              label: 'توضیحات',
              content: (
                <article className="border-border bg-card rounded-lg border p-6 shadow-sm sm:p-8">
                  <h2 className="text-foreground text-xl font-black">ویژگی‌های اصلی</h2>
                  <p className="text-muted mt-4 max-w-[62ch] text-sm leading-8">
                    {product.description}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {product.features.map((feature, index) => (
                      <div
                        key={`${feature}-${index}`}
                        className="border-border bg-background flex items-start gap-3 rounded-lg border p-4"
                      >
                        <span className="bg-accent text-background mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full">
                          <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <p className="text-foreground text-sm leading-7">{feature}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ),
            },
            {
              id: 'specs',
              label: 'مشخصات',
              content: (
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="border-foreground text-foreground border-2">
                    <div className="border-foreground border-b-2 px-4 py-2.5">
                      <span className="text-sm font-black">مشخصات محصول</span>
                    </div>
                    <div>
                      {specRows.map((row, index) => (
                        <div
                          key={row.label}
                          className={
                            index !== specRows.length - 1
                              ? 'border-foreground/25 flex items-center justify-between border-b px-4 py-2.5'
                              : 'flex items-center justify-between px-4 py-2.5'
                          }
                        >
                          <span className="text-muted text-sm font-bold">{row.label}</span>
                          <span className="text-sm font-black tabular-nums">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <aside className="border-border bg-surface rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FiInfo className="text-accent h-5 w-5" aria-hidden />
                      <h2 className="text-foreground text-lg font-black">نکته مصرف</h2>
                    </div>
                    <p className="text-muted mt-4 text-sm leading-8">
                      مقدار و زمان مصرف مکمل‌ها به هدف تمرینی، وضعیت سلامت و رژیم غذایی بستگی دارد.
                      قبل از مصرف منظم، برچسب محصول و نظر متخصص را در نظر بگیرید.
                    </p>
                  </aside>
                </div>
              ),
            },
            {
              id: 'reviews',
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
