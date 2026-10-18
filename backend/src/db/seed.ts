import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://your_username:your_password@localhost:5432/your_database";

const pool = new Pool({ connectionString });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
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

    CREATE TABLE IF NOT EXISTS flavors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await pool.end();
  console.log(
    `Product table ready with no seeded products in ${connectionString}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
