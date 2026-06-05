import ProductShowcase from "../components/ProductShowcase";
import { getProducts } from "../lib/graphql";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="mb-10 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-accent">محصولات</p>
        <h1 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          همه مکمل‌های بدنسازی
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
          در این بخش می‌توانید محصولات را بر اساس حالت پیش‌فرض، محبوب‌ترین‌ها یا پرفروش‌ترین‌ها مرتب کنید و وارد صفحه اختصاصی هر محصول شوید.
        </p>
      </section>

      <ProductShowcase products={products} />
    </main>
  );
}
