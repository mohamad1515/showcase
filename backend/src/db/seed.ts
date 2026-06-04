import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { products } from "./schema";
import { seedProducts } from "./seed-data";

const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), "data", "showcase.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

sqlite.exec(`
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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

db.insert(products).values(seedProducts).onConflictDoNothing({ target: products.slug }).run();
sqlite.close();

console.log(`Seeded ${seedProducts.length} products into ${dbPath}`);
