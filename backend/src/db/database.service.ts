import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { seedProducts } from "./seed-data";

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
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        tagline TEXT NOT NULL,
        summary TEXT NOT NULL,
        description TEXT NOT NULL,
        features TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('default', 'popular', 'best-selling')),
        price TEXT NOT NULL,
        weight TEXT NOT NULL,
        quantity TEXT NOT NULL DEFAULT '1',
        images TEXT NOT NULL DEFAULT '["/images/product.png"]',
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
    `);
    this.ensureColumn("products", "quantity", "TEXT NOT NULL DEFAULT '1'");
    this.ensureColumn(
      "products",
      "images",
      "TEXT NOT NULL DEFAULT '[\"/images/product.png\"]'",
    );
    this.ensureColumn("users", "role", "TEXT NOT NULL DEFAULT 'USER'");
    this.ensureColumn("users", "is_active", "INTEGER NOT NULL DEFAULT 1");
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

    const count = this.sqlite
      .prepare("SELECT COUNT(*) AS count FROM products")
      .get() as { count: number };
    if (count.count > 0) return;

    this.db.insert(schema.products).values(seedProducts).run();
  }

  private ensureColumn(table: string, column: string, definition: string) {
    const columns = this.sqlite
      .prepare(`PRAGMA table_info(${table})`)
      .all() as { name: string }[];
    if (columns.some((item) => item.name === column)) return;
    this.sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
