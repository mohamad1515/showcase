import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  persianName: text("persian_name").notNull(),
  englishName: text("english_name").notNull(),
  brand: text("brand").notNull(),
  brands: text("brands", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  status: text("status").notNull().default("active"),
  rating: integer("rating").notNull().default(0),
  flavor: text("flavor").notNull().default(""),
  flavors: text("flavors", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  productType: text("product_type").notNull().default("powder"),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  features: text("features", { mode: "json" }).$type<string[]>().notNull(),
  price: text("price").notNull(),
  compareAtPrice: text("compare_at_price"),
  weight: text("weight").notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(100),
  mainImage: text("main_image").notNull().default("/images/product.png"),
  galleryImages: text("gallery_images", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(["/images/product.png"]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const carts = sqliteTable("carts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  unitPrice: text("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  total: text("total").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sliders = sqliteTable("sliders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  image: text("image").notNull(),
  link: text("link").notNull().default("/products"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const flavors = sqliteTable("flavors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  status: text("status", { enum: ["UNANSWERED", "ANSWERED"] })
    .notNull()
    .default("UNANSWERED"),
  editedByAdmin: integer("edited_by_admin", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const replies = sqliteTable("replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  commentId: integer("comment_id").notNull(),
  adminId: integer("admin_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const commentVotes = sqliteTable("comment_votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
