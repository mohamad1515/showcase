/**
 * Product types and interfaces
 * Data is fetched from GraphQL backend (app/lib/graphql.ts)
 */

export type ProductCategory = "default" | "popular" | "best-selling";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: string[];
  category: ProductCategory;
  price: string;
  weight: string;
  quantity: string;
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
  price: string;
  weight: string;
  quantity: string;
  images: string[];
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
