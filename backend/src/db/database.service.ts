import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly sqlite: Database.Database;
  readonly db: BetterSQLite3Database<typeof schema>;

  constructor() {
    const dbPath =
      process.env.DATABASE_URL ??
      join(process.cwd(), "data", "showcase.sqlite");
    mkdirSync(dirname(dbPath), { recursive: true });
    this.sqlite = new Database(dbPath);
    this.db = drizzle(this.sqlite, { schema });
  }

  onModuleInit() {
    this.sqlite.pragma("journal_mode = WAL");
    this.createTables();
    this.seed();
  }

  onModuleDestroy() {
    this.sqlite.close();
  }

  private createTables() {
    const existingProductColumns = this.sqlite
      .prepare("PRAGMA table_info(products)")
      .all() as { name: string }[];
    const shouldResetProducts =
      existingProductColumns.length > 0 &&
      !existingProductColumns.some((column) => column.name === "persian_name");
    if (shouldResetProducts) {
      this.sqlite.exec("DROP TABLE products");
    }
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        persian_name TEXT NOT NULL,
        english_name TEXT NOT NULL,
        brand TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        rating INTEGER NOT NULL DEFAULT 0,
        flavor TEXT NOT NULL DEFAULT '',
        product_type TEXT NOT NULL DEFAULT 'powder',
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        description TEXT NOT NULL,
        features TEXT NOT NULL,
        price TEXT NOT NULL,
        compare_at_price TEXT,
        weight TEXT NOT NULL,
        review_count INTEGER NOT NULL DEFAULT 0,
        tags TEXT NOT NULL DEFAULT '[]',
        stock INTEGER NOT NULL DEFAULT 100,
        main_image TEXT NOT NULL DEFAULT '/images/product.png',
        gallery_images TEXT NOT NULL DEFAULT '["/images/product.png"]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        provider_id TEXT NOT NULL,
        password TEXT,
        role TEXT NOT NULL DEFAULT 'USER',
        is_active INTEGER NOT NULL DEFAULT 1,
        access_token TEXT,
        refresh_token TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sliders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        image TEXT NOT NULL,
        link TEXT NOT NULL DEFAULT '/products',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS flavors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(cart_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'canceled')),
        total TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        unit_price TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        status TEXT NOT NULL DEFAULT 'UNANSWERED' CHECK (status IN ('UNANSWERED', 'ANSWERED')),
        edited_by_admin INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_comments_product_created ON comments(product_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

      CREATE TABLE IF NOT EXISTS replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL UNIQUE REFERENCES comments(id) ON DELETE CASCADE,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comment_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL CHECK (type IN ('LIKE', 'DISLIKE')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(comment_id, user_id)
      );
    `);
    if (shouldResetProducts) this.sqlite.prepare("DELETE FROM products").run();
    this.ensureColumn("users", "role", "TEXT NOT NULL DEFAULT 'USER'");
    this.ensureColumn("users", "is_active", "INTEGER NOT NULL DEFAULT 1");
    this.ensureColumn(
      "products",
      "product_type",
      "TEXT NOT NULL DEFAULT 'powder'",
    );
    this.ensureColumn("products", "brands", "TEXT NOT NULL DEFAULT '[]'");
    this.ensureColumn("products", "flavors", "TEXT NOT NULL DEFAULT '[]'");
    this.migrateProductSlugs();
  }

  private migrateProductSlugs() {
    const rows = this.sqlite
      .prepare("SELECT id, slug, english_name FROM products")
      .all() as { id: number; slug: string; english_name: string }[];
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
      while (
        used.has(slug) ||
        (slug !== row.slug &&
          this.sqlite
            .prepare("SELECT id FROM products WHERE slug = ?")
            .get(slug))
      ) {
        slug = `${base}-${suffix++}`;
      }
      used.add(slug);
      if (slug !== row.slug) {
        this.sqlite
          .prepare("UPDATE products SET slug = ? WHERE id = ?")
          .run(slug, row.id);
      }
    }
  }
  private seed() {
    const now = new Date().toISOString();
    this.sqlite
      .prepare(
        `INSERT OR IGNORE INTO users (name, email, provider_id, password, role, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "Admin",
        "adminmokamelshop@gmail.com",
        "adminmokamelshop",
        "admin123!@#",
        "ADMIN",
        1,
        now,
      );

    const defaultCategories = [
      { slug: "sports-supplements", name: "مکمل های ورزشی" },
      { slug: "food-supplements", name: "مکمل های غذایی" },
    ];
    for (const category of defaultCategories) {
      this.sqlite
        .prepare(
          `INSERT OR IGNORE INTO categories (slug, name, description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(category.slug, category.name, "", now, now);
    }

    this.sqlite
      .prepare(
        `INSERT OR IGNORE INTO sliders (id, title, subtitle, image, link, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        1,
        "بهترین مکمل را برای هدف تمرینی خودت انتخاب کن",
        "محصولات ورزشی و غذایی با اطلاعات شفاف و کاربردی",
        "/images/slider/slider-1.jpg",
        "/products",
        now,
        now,
      );
  }

  private ensureColumn(table: string, column: string, definition: string) {
    const columns = this.sqlite
      .prepare(`PRAGMA table_info(${table})`)
      .all() as { name: string }[];
    if (columns.some((item) => item.name === column)) return;
    this.sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
