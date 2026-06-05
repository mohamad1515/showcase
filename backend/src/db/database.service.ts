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
    const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), "data", "showcase.sqlite");
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
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  private seed() {
    const count = this.sqlite.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
    if (count.count > 0) return;

    this.db.insert(schema.products).values(seedProducts).run();
  }
}
