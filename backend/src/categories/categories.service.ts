import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { categories, NewCategoryRow } from "../db/schema";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.input";

@Injectable()
export class CategoriesService {
  constructor(private readonly database: DatabaseService) {}

  findAll() {
    return this.database.db.select().from(categories).all();
  }

  findBySlug(slug: string) {
    const category = this.database.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .get();
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  create(input: CreateCategoryInput) {
    const now = new Date().toISOString();
    return this.database.db
      .insert(categories)
      .values({
        slug: input.slug.trim(),
        name: input.name.trim(),
        description: input.description?.trim() ?? "",
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  }

  update(slug: string, input: UpdateCategoryInput) {
    this.findBySlug(slug);
    const values: Partial<NewCategoryRow> = {
      ...(input.slug ? { slug: input.slug.trim() } : {}),
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    return this.database.db
      .update(categories)
      .set(values)
      .where(eq(categories.slug, slug))
      .returning()
      .get();
  }

  remove(slug: string) {
    const category = this.findBySlug(slug);
    this.database.db.delete(categories).where(eq(categories.slug, slug)).run();
    return category;
  }
}
