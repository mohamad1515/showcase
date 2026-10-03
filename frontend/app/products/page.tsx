import ProductCatalog from '../components/ProductCatalog';
import { getCategories, getProducts } from '../lib/graphql';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6">
      <section className="border-border mb-8 border-b pb-6 sm:mb-10 sm:pb-8">
        <p className="text-muted text-sm font-bold">فیت مکمل</p>
        <h1 className="text-foreground mt-3 text-3xl font-black sm:text-4xl">
          همه مکمل‌های بدنسازی
        </h1>
        <p className="text-muted mt-4 max-w-2xl text-sm leading-8">
          محصولات را بر اساس دسته‌بندی، موجودی، قیمت یا امتیاز بررسی و مقایسه کن.
        </p>
      </section>

      <ProductCatalog
        products={products}
        categoryOptions={categories.map((category) => ({
          value: category.slug,
          label: category.name,
        }))}
      />
    </main>
  );
}
