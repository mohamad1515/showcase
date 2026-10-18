import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  readonly db: NodePgDatabase<typeof schema>;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      "postgresql://your_username:your_password@localhost:5432/your_database";
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    await this.createTables();
    await this.seed();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async createTables() {
    const existingProductColumns = await this.pool.query<{
      column_name: string;
    }>(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'products'",
    );
    const shouldResetProducts =
      existingProductColumns.rows.length > 0 &&
      !existingProductColumns.rows.some(
        (column) => column.column_name === "persian_name",
      );
    if (shouldResetProducts) {
      await this.pool.query("DROP TABLE products");
    }
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        persian_name TEXT NOT NULL,
        english_name TEXT NOT NULL,
        brand TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        rating DOUBLE PRECISION NOT NULL DEFAULT 0,
        flavor TEXT NOT NULL DEFAULT '',
        product_type TEXT NOT NULL DEFAULT 'powder',
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        description TEXT NOT NULL,
        features JSONB NOT NULL,
        price TEXT NOT NULL,
        compare_at_price TEXT,
        weight TEXT NOT NULL,
        review_count INTEGER NOT NULL DEFAULT 0,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        stock INTEGER NOT NULL DEFAULT 100,
        main_image TEXT NOT NULL DEFAULT '/images/product.png',
        gallery_images JSONB NOT NULL DEFAULT '["/images/product.png"]'::jsonb,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        provider_id TEXT NOT NULL,
        password TEXT,
        role TEXT NOT NULL DEFAULT 'USER',
        is_active BOOLEAN NOT NULL DEFAULT true,
        access_token TEXT,
        refresh_token TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sliders (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        image TEXT NOT NULL,
        link TEXT NOT NULL DEFAULT '/products',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS flavors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(cart_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'canceled')),
        total TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        unit_price TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        status TEXT NOT NULL DEFAULT 'UNANSWERED' CHECK (status IN ('UNANSWERED', 'ANSWERED')),
        edited_by_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_comments_product_created ON comments(product_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

      CREATE TABLE IF NOT EXISTS replies (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL UNIQUE REFERENCES comments(id) ON DELETE CASCADE,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comment_votes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL CHECK (type IN ('LIKE', 'DISLIKE')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(comment_id, user_id)
      );
    `);
    if (shouldResetProducts) await this.pool.query("DELETE FROM products");
    await this.ensureColumn("users", "role", "TEXT NOT NULL DEFAULT 'USER'");
    await this.ensureColumn(
      "users",
      "is_active",
      "BOOLEAN NOT NULL DEFAULT true",
    );
    await this.ensureColumn(
      "products",
      "product_type",
      "TEXT NOT NULL DEFAULT 'powder'",
    );
    await this.ensureColumn(
      "products",
      "brands",
      "JSONB NOT NULL DEFAULT '[]'::jsonb",
    );
    await this.ensureColumn(
      "products",
      "flavors",
      "JSONB NOT NULL DEFAULT '[]'::jsonb",
    );
    await this.migrateProductSlugs();
  }

  private async migrateProductSlugs() {
    const { rows } = await this.pool.query<{
      id: number;
      slug: string;
      english_name: string;
    }>("SELECT id, slug, english_name FROM products");
    const used = new Set<string>();
    for (const row of rows) {
      const base =
        row.english_name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "product";
      let slug = base;
      let suffix = 2;
      while (used.has(slug) || (await this.slugTakenByAnother(slug, row.slug))) {
        slug = `${base}-${suffix++}`;
      }
      used.add(slug);
      if (slug !== row.slug) {
        await this.pool.query("UPDATE products SET slug = $1 WHERE id = $2", [
          slug,
          row.id,
        ]);
      }
    }
  }

  private async slugTakenByAnother(slug: string, currentSlug: string) {
    if (slug === currentSlug) return false;
    const { rows } = await this.pool.query(
      "SELECT id FROM products WHERE slug = $1",
      [slug],
    );
    return rows.length > 0;
  }

  private async seed() {
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO users (name, email, provider_id, password, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING`,
      ["Admin", "adminmokamelshop@gmail.com", "adminmokamelshop", "admin123!@#", "ADMIN", true, now],
    );

    const defaultCategories = [
      { slug: "sports-supplements", name: "مکمل های ورزشی" },
      { slug: "food-supplements", name: "مکمل های غذایی" },
    ];
    for (const category of defaultCategories) {
      await this.pool.query(
        `INSERT INTO categories (slug, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [category.slug, category.name, "", now, now],
      );
    }

    await this.pool.query(
      `INSERT INTO sliders (id, title, subtitle, image, link, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        1,
        "بهترین مکمل را برای هدف تمرینی خودت انتخاب کن",
        "محصولات ورزشی و غذایی با اطلاعات شفاف و کاربردی",
        "/images/slider/slider-1.jpg",
        "/products",
        now,
        now,
      ],
    );
  }

  private async ensureColumn(table: string, column: string, definition: string) {
    const { rows } = await this.pool.query<{ column_name: string }>(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
      [table, column],
    );
    if (rows.length > 0) return;
    await this.pool.query(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    );
  }
}
