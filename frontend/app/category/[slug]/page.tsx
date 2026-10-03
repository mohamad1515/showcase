import { notFound } from 'next/navigation';
import ProductCatalog from '../../components/ProductCatalog';
import { getCategories, getProducts } from '../../lib/graphql';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  return category ? { title: `${category.name} | فیت مکمل` } : {};
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) notFound();

  const categoryProducts = products.filter(
    (product) => product.category === category.name || product.category === category.slug,
  );

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6" dir="rtl">
      <header className="border-border mb-8 border-b pb-6 sm:mb-10 sm:pb-8">
        <p className="text-muted text-sm font-bold">دسته‌بندی محصولات</p>
        <h1 className="text-foreground mt-3 text-3xl font-black sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="text-muted mt-4 max-w-2xl text-sm leading-8">{category.description}</p>
        )}
      </header>
      <ProductCatalog
        products={categoryProducts}
        initialCategory={category.slug}
        categoryOptions={categories.map((item) => ({ value: item.slug, label: item.name }))}
      />
    </main>
  );
}
