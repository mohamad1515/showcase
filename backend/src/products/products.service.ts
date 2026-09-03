import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { NewProductRow, products } from "../db/schema";
import { CreateProductInput, UpdateProductInput } from "./product.input";

const categories = ["default", "popular", "best-selling"] as const;
type ProductCategory = (typeof categories)[number];
const productTypes = ["powder", "liquid", "tablet", "capsule"] as const;
type ProductType = (typeof productTypes)[number];

@Injectable()
export class ProductsService {
  constructor(private readonly database: DatabaseService) {}

  findAll(category?: string) {
    const rows = category
      ? this.database.db
          .select()
          .from(products)
          .where(eq(products.category, this.toCategory(category)))
          .all()
      : this.database.db.select().from(products).all();

    return rows.map((product) => this.normalizeProduct(product));
  }

  findBySlug(slug: string) {
    const normalizedSlug = this.decodeSlug(slug);
    const product = this.database.db
      .select()
      .from(products)
      .where(eq(products.slug, normalizedSlug))
      .get();
    if (!product)
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);

    return this.normalizeProduct(product);
  }

  create(input: CreateProductInput) {
    const category = this.toCategory(input.category);
    const productType = this.toProductType(input.productType);
    const now = new Date().toISOString();

    const slug = this.generateSlug();

    return this.database.db
      .insert(products)
      .values({
        slug,
        name: input.name,
        tagline: input.tagline,
        summary: input.summary,
        description: input.description,
        features: input.features,
        category,
        productType,
        price: this.formatPrice(input.price),
        weight: this.formatMeasurement(input.weight, productType),
        quantity: this.formatQuantity(input.quantity, productType),
        tags: this.normalizeTags(input.tags),
        stock: input.stock ?? 100,
        images: this.normalizeImages(input.images),
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  }

  update(slug: string, input: UpdateProductInput) {
    this.findBySlug(slug);
    const {
      category,
      productType,
      price,
      images,
      tags,
      weight,
      quantity,
      ...rest
    } = input;
    const current = this.findBySlug(slug);
    const resolvedType = productType
      ? this.toProductType(productType)
      : this.toProductType(current.productType);
    const values: Partial<NewProductRow> = {
      ...rest,
      ...(category ? { category: this.toCategory(category) } : {}),
      ...(productType ? { productType: resolvedType } : {}),
      ...(price ? { price: this.formatPrice(price) } : {}),
      ...(weight !== undefined
        ? { weight: this.formatMeasurement(weight, resolvedType) }
        : {}),
      ...(quantity !== undefined
        ? { quantity: this.formatQuantity(quantity, resolvedType) }
        : {}),
      ...(tags !== undefined ? { tags: this.normalizeTags(tags) } : {}),
      ...(images ? { images: this.normalizeImages(images) } : {}),
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
      throw new BadRequestException(
        `Category must be one of: ${categories.join(", ")}`,
      );
    }
    return category as ProductCategory;
  }

  private toProductType(productType?: string | null): ProductType {
    const normalized = productType ?? "powder";
    if (!productTypes.includes(normalized as ProductType)) {
      throw new BadRequestException(
        `Product type must be one of: ${productTypes.join(", ")}`,
      );
    }
    return normalized as ProductType;
  }

  private generateSlug() {
    return `product-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  }

  private decodeSlug(slug: string) {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  }

  private formatPrice(price: string) {
    const digits = this.toEnglishDigits(price).replace(/[^\d]/g, "");
    if (!digits) return price;
    return Number(digits).toLocaleString("en-US");
  }

  private formatMeasurement(value: string, productType: ProductType) {
    const normalized = this.toEnglishDigits(value)
      .trim()
      .replace(/\s*(گرم|کیلوگرم|میلی(?:‌| )?گرم|ml)\s*/gi, "");
    if (!normalized)
      throw new BadRequestException("Product measurement is required.");

    if (productType === "powder") {
      if (/[./]/.test(normalized)) {
        return `${normalized.replace("/", ".")} کیلوگرم`;
      }
      const grams = Number(normalized.replace(/[^\d]/g, ""));
      if (!grams)
        throw new BadRequestException("Powder weight must be a number.");
      return grams >= 1000 ? `${grams / 1000} کیلوگرم` : `${grams} گرم`;
    }

    const amount = normalized.replace(/[^\d.]/g, "");
    if (!amount)
      throw new BadRequestException("Product measurement must be a number.");
    if (productType === "liquid") return `${amount} میلی‌گرم`;
    return `${amount} گرم`;
  }

  private formatQuantity(value: string, productType: ProductType) {
    const amount = this.toEnglishDigits(value).replace(/[^\d]/g, "");
    if (!amount || Number(amount) < 1) {
      throw new BadRequestException("Product quantity must be at least 1.");
    }
    return productType === "tablet" ||
      productType === "liquid" ||
      productType === "capsule"
      ? `${amount} عددی`
      : amount;
  }

  private normalizeTags(tags?: string[]) {
    return [...new Set(tags?.map((tag) => tag.trim()).filter(Boolean) ?? [])];
  }

  private toEnglishDigits(value: string) {
    return value.replace(/[۰-۹٠-٩]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10),
    );
  }

  private normalizeImages(images?: string[]) {
    const cleaned = images?.map((image) => image.trim()).filter(Boolean) ?? [];
    return cleaned.length > 0 ? cleaned : ["/images/product.png"];
  }

  private normalizeProduct(product: any) {
    const parseList = (value: unknown, fallback: string[] = []) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch {
          return fallback;
        }
      }
      return fallback;
    };

    return {
      ...product,
      productType: product.productType ?? "powder",
      tags: parseList(product.tags, []),
      features: parseList(product.features, []),
      images: parseList(product.images, ["/images/product.png"]),
    };
  }
}
