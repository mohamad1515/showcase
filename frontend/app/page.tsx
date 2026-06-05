import Image from "next/image";
import Link from "next/link";
import ProductShowcase from "./components/ProductShowcase";
import { getProducts } from "./lib/graphql";

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="absolute inset-0">
          <Image
            src="/images/banner.jpg"
            alt="بنر مکمل‌های بدنسازی"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-background/30" />
          <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-background via-background/85 to-transparent" />
        </div>
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-14 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-bold text-accent shadow-sm">
              معرفی تخصصی مکمل‌های بدنسازی
            </p>
            <h1 className="text-4xl font-black leading-tight text-foreground sm:text-5xl">
              بهترین مکمل را برای هدف تمرینی خودت انتخاب کن
            </h1>
            <p className="text-base leading-8 text-muted sm:text-lg">
              از وی پروتئین و کراتین تا گینر و آمینو؛ هر محصول صفحه اختصاصی، توضیح کاربردی و ویژگی‌های سریع برای مقایسه دارد.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-black text-white transition hover:bg-accent-strong"
              >
                مشاهده محصولات
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface/90 px-6 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
              >
                صفحه همه محصولات
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 sm:px-8 lg:px-12">
        <ProductShowcase products={products} />

        <section id="about" className="grid gap-6 rounded-lg border border-border bg-surface p-6 shadow-sm md:grid-cols-[0.8fr_1.2fr] md:p-8">
          <div>
            <p className="text-sm font-bold text-accent">درباره ما</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">راهنمای انتخاب مکمل، ساده و شفاف</h2>
          </div>
          <p className="text-sm leading-8 text-muted">
            هدف فیت مکمل معرفی محصولات بدنسازی با زبان قابل فهم است تا کاربر بتواند قبل از خرید، کاربرد، ویژگی‌ها و تفاوت محصولات را بهتر بشناسد. این پروژه برای توسعه بیشتر فروشگاه، بلاگ یا سیستم مقایسه محصول هم آماده است.
          </p>
        </section>
      </div>
    </main>
  );
}
