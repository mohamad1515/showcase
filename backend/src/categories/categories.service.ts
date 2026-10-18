import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { categories, NewCategoryRow } from "../db/schema";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.input";

@Injectable()
export class CategoriesService {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db.select().from(categories);
  }

  async findBySlug(slug: string) {
    const category = await this.database.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .then((rows) => rows[0]);
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async create(input: CreateCategoryInput) {
    const now = new Date().toISOString();
    const [category] = await this.database.db
      .insert(categories)
      .values({
        slug: input.slug.trim(),
        name: input.name.trim(),
        description: input.description?.trim() ?? "",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return category;
  }

  async update(slug: string, input: UpdateCategoryInput) {
    await this.findBySlug(slug);
    const values: Partial<NewCategoryRow> = {
      ...(input.slug ? { slug: input.slug.trim() } : {}),
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    const [category] = await this.database.db
      .update(categories)
      .set(values)
      .where(eq(categories.slug, slug))
      .returning();
    return category;
  }

  async remove(slug: string) {
    const category = await this.findBySlug(slug);
    await this.database.db.delete(categories).where(eq(categories.slug, slug));
    return category;
  }
}
