import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  features: text("features", { mode: "json" }).$type<string[]>().notNull(),
  category: text("category", {
    enum: ["default", "popular", "best-selling"],
  }).notNull(),
  price: text("price").notNull(),
  weight: text("weight").notNull(),
  quantity: text("quantity").notNull().default("1"),
  images: text("images", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(["/images/product.png"]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
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

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type SliderRow = typeof sliders.$inferSelect;
export type NewSliderRow = typeof sliders.$inferInsert;
