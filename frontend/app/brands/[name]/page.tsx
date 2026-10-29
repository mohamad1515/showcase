import { notFound } from 'next/navigation';
import ProductCatalog from '../../components/ProductCatalog';
import { getProducts } from '../../lib/graphql';

type PageProps = { params: Promise<{ name: string }> };

export default async function BrandPage({ params }: PageProps) {
  const [{ name }, products] = await Promise.all([params, getProducts()]);
  const brandName = name;
  const matchingProducts = products.filter((product) => (product.brands?.length ? product.brands : [product.brand]).some((brand) => brand.toLocaleLowerCase() === brandName.toLocaleLowerCase()));
  if (!matchingProducts.length) notFound();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6">
      <header className="border-border mb-8 border-b pb-6">
        <p className="text-muted text-sm font-bold">محصولات برند</p>
        <h1 className="text-foreground mt-3 text-3xl font-black sm:text-4xl">{brandName}</h1>
      </header>
      <ProductCatalog products={matchingProducts} initialBrand={brandName} />
    </main>
  );
}
