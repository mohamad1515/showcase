import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { NewProductRow, products } from "../db/schema";
import { CreateProductInput, UpdateProductInput } from "./product.input";

const categories = ["default", "popular", "best-selling"] as const;
type ProductCategory = (typeof categories)[number];

@Injectable()
export class ProductsService {
  constructor(private readonly database: DatabaseService) {}

  findAll(category?: string) {
    if (!category) {
      return this.database.db.select().from(products).all();
    }

    return this.database.db
      .select()
      .from(products)
      .where(eq(products.category, this.toCategory(category)))
      .all();
  }

  findBySlug(slug: string) {
    const product = this.database.db.select().from(products).where(eq(products.slug, slug)).get();
    if (!product) throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    return product;
  }

  create(input: CreateProductInput) {
    const category = this.toCategory(input.category);
    const now = new Date().toISOString();

    return this.database.db
      .insert(products)
      .values({
        ...input,
        category,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  }

  update(slug: string, input: UpdateProductInput) {
    this.findBySlug(slug);
    const { category, ...rest } = input;
    const values: Partial<NewProductRow> = {
      ...rest,
      ...(category ? { category: this.toCategory(category) } : {}),
      updatedAt: new Date().toISOString(),
    };

    return this.database.db
      .update(products)
      .set(values)
      .where(eq(products.slug, slug))
      .returning()
      .get();
  }

  remove(slug: string) {
    const product = this.findBySlug(slug);
    this.database.db.delete(products).where(eq(products.slug, slug)).run();
    return product;
  }

  private toCategory(category: string): ProductCategory {
    if (!categories.includes(category as ProductCategory)) {
      throw new BadRequestException(`Category must be one of: ${categories.join(", ")}`);
    }
    return category as ProductCategory;
  }
}
