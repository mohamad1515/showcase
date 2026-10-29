import { notFound } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';

import ProductImageGallery from '../../components/ProductImageGallery';
import ProductPurchaseRow from '../../components/ProductPurchaseRow';
import ProductReviews from '../../components/reviews/ProductReviews';
import RelatedProducts from '../../components/RelatedProducts';
import StarRating from '../../components/reviews/StarRating';
import Tabs from '../../components/ui/Tabs';
import { getProductBySlug, getProducts } from '../../lib/graphql';
import { getProductCategoryName, type Product } from '../../lib/products';

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
    { label: 'برند', value: product.brand },
    { label: 'دسته‌بندی', value: getProductCategoryName(product.category) },
    { label: 'وزن', value: product.weight },
    { label: 'طعم', value: product.flavors?.join('، ') || product.flavor },
    { label: 'نوع محصول', value: typeLabel },
    { label: 'سازنده', value: product.manufacturer },
    { label: 'کشور مبدأ', value: product.countryOfOrigin },
    { label: 'اندازهٔ وعده', value: product.servingSize },
    { label: 'تعداد وعده در بسته', value: product.servingsPerContainer },
    { label: 'شناسه/کد رهگیری', value: product.traceabilityCode },
    { label: 'اطلاعات انقضا', value: product.expiryInfo },
    { label: 'ترکیبات', value: product.ingredients },
    { label: 'اطلاعات تغذیه‌ای', value: product.nutritionFacts },
  ].filter((row) => row.value?.trim());
  const inStock = product.stock > 0;
  const formattedPrice = new Intl.NumberFormat('fa-IR').format(
    Number(product.price.replace(/[^\d]/g, '')) || 0,
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        {/* Info column */}
        <div className="space-y-7">
          <div className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="min-w-0 text-3xl leading-tight font-black tracking-tight text-foreground sm:text-4xl">{productTitle(product)}</h1>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="border-border bg-background text-muted rounded-full border px-3 py-1 text-xs font-bold">
                  {typeLabel}
                </span>
                <span className="border-border bg-surface text-muted rounded-full border px-3 py-1 text-xs font-bold">
                  {product.categoryName || getProductCategoryName(product.category)}
                </span>
              </div>
            </div>
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
            ) : null}
          </a>

          <p className="text-foreground/90 max-w-[62ch] text-base leading-8">
            {product.summary}
          </p>

          {product.features.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {product.features.slice(0, 9).map((feature, index) => (
                <div key={`${feature}-${index}`} className="border-border bg-surface flex items-start gap-2 rounded-lg border p-3">
                  <span className="bg-accent text-background mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full">
                    <FiCheck className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <p className="text-foreground text-xs leading-6">{feature}</p>
                </div>
              ))}
            </div>
          )}
          {/* Price + stock */}
          <div className="border-border flex items-end justify-between gap-4 border-y py-5">
            <div>
              <p className="text-muted text-xs font-bold">قیمت</p>
              <p className="text-foreground mt-1 text-3xl font-black tabular-nums">
                {formattedPrice}
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

        {/* Gallery follows the details in RTL, so it sits in the left column. */}
        <div className="lg:sticky lg:top-8">
          <ProductImageGallery images={product.images} productName={productTitle(product)} />
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
                  <h2 className="text-foreground text-xl font-black">توضیحات کامل محصول</h2>
                  <p className="text-muted mt-4 max-w-[62ch] text-sm leading-8">
                    {product.description}
                  </p>
                  {product.usageInstructions && (
                    <aside className="border-border bg-background mt-6 rounded-lg border p-4">
                      <h3 className="text-foreground font-black">نکته و روش مصرف</h3>
                      <p className="text-muted mt-2 text-sm leading-7">{product.usageInstructions}</p>
                      {product.warnings && <p className="text-muted mt-2 text-xs leading-6">{product.warnings}</p>}
                    </aside>
                  )}
                </article>
              ),
            },
            {
              id: 'specs',
              label: 'مشخصات',
              content: (
                <div className="max-w-4xl">
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

      <RelatedProducts products={allProducts} currentProduct={product} />
    </main>
  );
}
