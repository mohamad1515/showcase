import Link from 'next/link';
import { FiArrowLeft, FiTag } from 'react-icons/fi';
import { getProducts } from '../lib/graphql';

function brandPath(name: string) {
  return `/brands/${encodeURIComponent(name)}`;
}

export default async function BrandsPage() {
  const products = await getProducts();
  const brandNames = [...new Set(products.flatMap((product) => product.brands?.length ? product.brands : [product.brand]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fa'));

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6">
      <header className="border-border mb-8 border-b pb-6">
        <p className="text-muted text-sm font-bold">انتخاب از میان برندها</p>
        <h1 className="text-foreground mt-3 text-3xl font-black sm:text-4xl">برندهای مکمل</h1>
        <p className="text-muted mt-3 text-sm leading-7">محصولات هر برند را جداگانه مرور کنید.</p>
      </header>
      {brandNames.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandNames.map((name) => {
            const count = products.filter((product) => (product.brands?.length ? product.brands : [product.brand]).some((brand) => brand.toLocaleLowerCase() === name.toLocaleLowerCase())).length;
            return <Link key={name} href={brandPath(name)} className="border-border bg-card hover:border-accent group flex min-h-28 items-center justify-between rounded-lg border p-5 transition-colors"><span className="flex items-center gap-3"><span className="bg-accent/15 text-accent-strong grid h-11 w-11 place-items-center rounded-full"><FiTag aria-hidden /></span><span><span className="text-foreground block font-black">{name}</span><span className="text-muted mt-1 block text-xs">{count} محصول</span></span></span><FiArrowLeft className="text-muted group-hover:text-accent" aria-hidden /></Link>;
          })}
        </div>
      ) : (
        <div className="border-border rounded-lg border border-dashed p-8 text-center"><p className="text-muted text-sm">هنوز برندی برای محصولات ثبت نشده است.</p></div>
      )}
    </main>
  );
}
