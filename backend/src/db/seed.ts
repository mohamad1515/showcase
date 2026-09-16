import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const dbPath =
  process.env.DATABASE_URL ?? join(process.cwd(), "data", "showcase.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

sqlite.exec(`
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

  CREATE TABLE IF NOT EXISTS flavors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

sqlite.close();

console.log(`Product table ready with no seeded products in ${dbPath}`);
