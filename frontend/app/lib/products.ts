export type ProductCategory = string;

const productCategoryLabels: Record<string, string> = {
  'sports-supplements': 'مکمل‌های ورزشی',
  'food-supplements': 'مکمل‌های غذایی',
  'whey-protein': 'پروتئین وی',
  creatine: 'کراتین',
  bcaa: 'آمینو و BCAA',
  gainer: 'گینر',
  electrolyte: 'الکترولیت',
  'pre-workout': 'پیش‌تمرین',
  'omega-3': 'امگا ۳',
  collagen: 'کلاژن',
  'cla-carnitine': 'CLA و کارنیتین',
  'whey-isolate': 'پروتئین وی ایزوله',
};

export function getProductCategoryName(category: string) {
  return productCategoryLabels[category] ?? category.replaceAll('-', ' ');
}

/**
 * Product types and interfaces
 * Data is fetched from GraphQL backend (app/lib/graphql.ts)
 */

export type Product = {
  id?: string;
  slug: string;
  persianName: string;
  englishName: string;
  brand: string;
  brands: string[];
  status: string;
  rating: number;
  flavor: string;
  flavors: string[];
  productType: "powder" | "liquid" | "beverage" | "tablet" | "capsule" | string;
  summary: string;
  description: string;
  ingredients?: string;
  nutritionFacts?: string;
  usageInstructions?: string;
  warnings?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  servingSize?: string;
  servingsPerContainer?: string;
  traceabilityCode?: string;
  expiryInfo?: string;
  features: string[];
  category: string;
  categoryName?: string;
  price: string;
  compareAtPrice?: string;
  weight: string;
  reviewCount: number;
  salesCount?: number;
  tags: string[];
  stock: number;
  mainImage: string;
  galleryImages: string[];
  name: string;
  tagline: string;
  quantity: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = {
  persianName: string;
  englishName: string;
  brand: string;
  brands?: string[];
  status: string;
  flavor: string;
  flavors?: string[];
  productType: "powder" | "liquid" | "beverage" | "tablet" | "capsule" | string;
  summary: string;
  description: string;
  ingredients?: string;
  nutritionFacts?: string;
  usageInstructions?: string;
  warnings?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  servingSize?: string;
  servingsPerContainer?: string;
  traceabilityCode?: string;
  expiryInfo?: string;
  features: string[];
  category: string;
  price: string;
  compareAtPrice?: string;
  weight: string;
  tags: string[];
  stock?: number;
  mainImage: string;
  galleryImages: string[];
};

export type CartItem = {
  id: string;
  quantity: number;
  lineTotal: string;
  product: Product;
};

export type Cart = {
  id: string;
  items: CartItem[];
  total: string;
  itemCount: number;
};

export type OrderItem = {
  id: string;
  productId: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  total: string;
};

export type Order = {
  id: string;
  status: "pending" | "paid" | "shipped" | "canceled" | string;
  total: string;
  createdAt: string;
  items: OrderItem[];
};

/** Remove duplicate records and repeated product variants before rendering a carousel. */
export function uniqueProducts(products: Product[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    const slug = product.slug.trim().toLocaleLowerCase();
    const identity = [
      product.englishName || product.name || product.persianName,
      product.brand,
      product.weight,
      [...(product.flavors?.length ? product.flavors : [product.flavor])].sort().join('|'),
    ]
      .map((part) => part.trim().replace(/\s+/g, ' ').toLocaleLowerCase())
      .join('|');
    if (seen.has(slug) || seen.has(identity)) return false;
    seen.add(slug);
    seen.add(identity);
    return true;
  });
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | string;
  is_active: boolean;
  created_at?: string;
};

export type Category = {
  id?: string;
  slug: string;
  name: string;
  description: string;
};

export type Flavor = {
  id: string;
  name: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type Slider = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
};

export type CommentStatus = "UNANSWERED" | "ANSWERED";

export type VoteType = "LIKE" | "DISLIKE";

export type Reply = {
  id: string;
  content: string;
  adminName: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  userName: string;
  rating: number;
  content: string;
  status: CommentStatus;
  editedByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  myVote: VoteType | null;
  reply: Reply | null;
  productSlug: string;
  productName: string;
};

export type CommentInput = {
  productSlug: string;
  rating: number;
  content: string;
};

export type ProductReviews = {
  average: number;
  count: number;
  /** Reviews per star, index 0 = 1 star ... index 4 = 5 stars. */
  distribution: number[];
  comments: Comment[];
};
