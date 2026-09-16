export type ProductCategory = string;

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
  features: string[];
  category: string;
  price: string;
  compareAtPrice?: string;
  weight: string;
  reviewCount: number;
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
  rating: number;
  flavor: string;
  flavors?: string[];
  productType: "powder" | "liquid" | "beverage" | "tablet" | "capsule" | string;
  summary: string;
  description: string;
  features: string[];
  category: string;
  price: string;
  compareAtPrice?: string;
  weight: string;
  reviewCount: number;
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
