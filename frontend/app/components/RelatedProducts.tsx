import type { Product } from '../lib/products';
import ProductCard from './ProductCard';

export default function RelatedProducts({
  products,
  excludeSlug,
}: {
  products: Product[];
  excludeSlug: string;
}) {
  const related = products.filter((product) => product.slug !== excludeSlug).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-foreground text-xl font-black">محصولات مرتبط</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {related.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
