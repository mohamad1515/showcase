import ProductCatalog from '../components/ProductCatalog';
import { getProducts } from '../lib/graphql';

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: PageProps) {
  const [{ q = '' }, products] = await Promise.all([searchParams, getProducts()]);
  const query = q.trim();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6">
      <section className="border-border mb-8 border-b pb-6 sm:mb-10 sm:pb-8">
        <p className="text-muted text-sm font-bold">جستجو در فروشگاه</p>
        <h1 className="text-foreground mt-3 text-3xl font-black sm:text-4xl">{query ? `نتایج جستجو برای «${query}»` : 'جستجوی محصولات'}</h1>
        <form action="/search" className="mt-5 flex max-w-xl gap-2">
          <input name="q" defaultValue={query} placeholder="نام محصول، برند یا طعم" className="glass-input h-12 min-w-0 flex-1 rounded-md px-4 text-sm" />
          <button className="bg-accent text-black h-12 rounded-md px-5 text-sm font-black" type="submit">جستجو</button>
        </form>
      </section>
      <ProductCatalog products={products} initialQuery={query} />
    </main>
  );
}
