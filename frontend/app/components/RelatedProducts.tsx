import { uniqueProducts, type Product } from '../lib/products';
import RelatedProductsCarousel from './RelatedProductsCarousel';

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export default function RelatedProducts({
  products,
  currentProduct,
}: {
  products: Product[];
  currentProduct: Product;
}) {
  const candidates = uniqueProducts(products).filter(
    (product) =>
      product.slug.trim().toLocaleLowerCase() !== currentProduct.slug.trim().toLocaleLowerCase() &&
      !(currentProduct.id && product.id === currentProduct.id),
  );
  const sameCategory = shuffle(candidates.filter((product) => product.category === currentProduct.category));
  const sameType = shuffle(candidates.filter(
    (product) => product.productType === currentProduct.productType &&
      product.category !== currentProduct.category,
  ));
  const remaining = shuffle(candidates.filter(
    (product) => product.category !== currentProduct.category &&
      product.productType !== currentProduct.productType,
  ));
  const related = [...sameCategory, ...sameType, ...remaining].slice(0, 6);
  if (related.length === 0) return null;

  return <RelatedProductsCarousel products={related} />;
}
