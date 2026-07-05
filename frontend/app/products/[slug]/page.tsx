import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "../../lib/graphql";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "محصول پیدا نشد" };
  }

  return {
    title: `${product.name} | فیت مکمل`,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="grid gap-8 rounded-lg border border-border bg-surface p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-8">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
          <Image
            src={product.images?.[0] ?? "/images/product.png"}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-accent">صفحه محصول</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              {product.tagline}
            </p>
          </div>

          <p className="text-base leading-8 text-foreground/90">
            {product.description}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-bold text-muted">قیمت</p>
              <p className="mt-2 text-xl font-black text-accent">
                {product.price} تومان
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-bold text-muted">وزن و تعداد</p>
              <p className="mt-2 text-xl font-black text-foreground">
                وزن: {product.weight} · تعداد: {product.quantity}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-foreground">
            ویژگی‌های اصلی
          </h2>
          <div className="mt-6 grid gap-4">
            {product.features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-4 rounded-lg border border-border bg-background p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/10 text-sm font-black text-accent">
                  ✓
                </span>
                <p className="text-sm leading-7 text-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-black text-foreground">نکته مصرف</h2>
          <p className="mt-4 text-sm leading-8 text-muted">
            مقدار و زمان مصرف مکمل‌ها به هدف تمرینی، وضعیت سلامت و رژیم غذایی
            بستگی دارد. قبل از مصرف منظم، برچسب محصول و نظر متخصص را در نظر
            بگیرید.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-black text-white transition hover:bg-accent-strong"
            >
              مشاهده محصولات دیگر
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
