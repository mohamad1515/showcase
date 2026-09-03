/**
 * Product types and interfaces
 * Data is fetched from GraphQL backend (app/lib/graphql.ts)
 */

export type ProductCategory = "default" | "popular" | "best-selling";
export type ProductType = "powder" | "liquid" | "tablet" | "capsule";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: string[];
  category: ProductCategory;
  productType: ProductType;
  price: string;
  weight: string;
  quantity: string;
  tags: string[];
  stock: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = {
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: string[];
  category: ProductCategory;
  productType: ProductType;
  price: string;
  weight: string;
  quantity: string;
  tags: string[];
  stock?: number;
  images: string[];
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

export type Slider = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
};
