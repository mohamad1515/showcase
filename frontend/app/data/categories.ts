import type { Category } from '../lib/products';

const categoryImages: Record<string, string> = {
  'sports-supplements': '/images/category/cat2.png',
  'food-supplements': '/images/category/cat4.png',
  cratine: '/images/category/cat5.png',
  protein: '/images/category/cat3.png',
  gainer: '/images/category/cat1.png',
  pomp: '/images/category/cat6.png',
};

export function getHomeCategories(categories: Category[]) {
  return categories.map((category, index) => ({
    ...category,
    image: categoryImages[category.slug] ?? `/images/category/cat${(index % 8) + 1}.png`,
  }));
}
