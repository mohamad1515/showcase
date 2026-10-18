import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  persianName: text("persian_name").notNull(),
  englishName: text("english_name").notNull(),
  brand: text("brand").notNull(),
  brands: jsonb("brands").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("active"),
  // A decimal average of comment ratings (e.g. 4.3), not an integer — SQLite's
  // dynamic typing let this live in an INTEGER column; Postgres enforces the
  // declared type, so this needs a real numeric column.
  rating: doublePrecision("rating").notNull().default(0),
  flavor: text("flavor").notNull().default(""),
  flavors: jsonb("flavors").$type<string[]>().notNull().default([]),
  productType: text("product_type").notNull().default("powder"),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  price: text("price").notNull(),
  compareAtPrice: text("compare_at_price"),
  weight: text("weight").notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(100),
  mainImage: text("main_image").notNull().default("/images/product.png"),
  galleryImages: jsonb("gallery_images")
    .$type<string[]>()
    .notNull()
    .default(["/images/product.png"]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "shipped", "canceled"],
  })
    .notNull()
    .default("pending"),
  total: text("total").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  unitPrice: text("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  total: text("total").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sliders = pgTable("sliders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  image: text("image").notNull(),
  link: text("link").notNull().default("/products"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const flavors = pgTable("flavors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  role: text("role").notNull().default("USER"),
  isActive: boolean("is_active").notNull().default(true),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: text("created_at").notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  status: text("status", { enum: ["UNANSWERED", "ANSWERED"] })
    .notNull()
    .default("UNANSWERED"),
  editedByAdmin: boolean("edited_by_admin").notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const replies = pgTable("replies", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  adminId: integer("admin_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const commentVotes = pgTable("comment_votes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type", { enum: ["LIKE", "DISLIKE"] }).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type CartRow = typeof carts.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type SliderRow = typeof sliders.$inferSelect;
export type NewSliderRow = typeof sliders.$inferInsert;
export type FlavorRow = typeof flavors.$inferSelect;
export type NewFlavorRow = typeof flavors.$inferInsert;
export type BrandRow = typeof brands.$inferSelect;
export type NewBrandRow = typeof brands.$inferInsert;
export type CommentRow = typeof comments.$inferSelect;
export type NewCommentRow = typeof comments.$inferInsert;
export type ReplyRow = typeof replies.$inferSelect;
export type NewReplyRow = typeof replies.$inferInsert;
export type CommentVoteRow = typeof commentVotes.$inferSelect;
export type NewCommentVoteRow = typeof commentVotes.$inferInsert;
