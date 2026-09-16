import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { categories, NewProductRow, products } from "../db/schema";
import { CreateProductInput, UpdateProductInput } from "./product.input";

const productTypes = [
  "powder",
  "liquid",
  "beverage",
  "tablet",
  "capsule",
] as const;

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
    const flavor = this.toFlavor(input.flavor, productType);
    const now = new Date().toISOString();

    const slug = this.generateSlug(input.englishName);

    return this.database.db
      .insert(products)
      .values({
        slug,
        persianName: input.persianName,
        englishName: input.englishName,
        brand: input.brands?.[0]?.trim() || input.brand,
        brands: this.normalizeNames(input.brands, input.brand),
        status: input.status,
        rating: input.rating,
        flavor: input.flavors?.[0]?.trim() || flavor,
        flavors: this.normalizeNames(input.flavors, input.flavor),
        productType,
        summary: input.summary,
        description: input.description,
        features: input.features,
        category,
        price: this.formatPrice(input.price),
        compareAtPrice: input.compareAtPrice
          ? this.formatPrice(input.compareAtPrice)
          : null,
        weight: input.weight.trim(),
        reviewCount: input.reviewCount,
        tags: this.normalizeTags(input.tags),
        stock: input.stock ?? 100,
        mainImage: input.mainImage?.trim() || "/images/product.png",
        galleryImages: this.normalizeImages(input.galleryImages),
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
      price,
      galleryImages,
      mainImage,
      tags,
      productType,
      flavor,
      brands,
      flavors,
      englishName,
      ...rest
    } = input;
    const current = this.findBySlug(slug);
    const resolvedType = productType
      ? this.toProductType(productType)
      : current.productType;
    const values: Partial<NewProductRow> = {
      ...rest,
      ...(category ? { category: this.toCategory(category) } : {}),
      ...(price ? { price: this.formatPrice(price) } : {}),
      ...(productType ? { productType: resolvedType } : {}),
      ...(flavor !== undefined || productType
        ? { flavor: this.toFlavor(flavor ?? current.flavor, resolvedType) }
        : {}),
      ...(brands !== undefined
        ? {
            brands: this.normalizeNames(brands, brands[0] ?? current.brand),
            brand: brands[0] ?? current.brand,
          }
        : {}),
      ...(flavors !== undefined
        ? {
            flavors: this.normalizeNames(flavors, flavors[0] ?? current.flavor),
            flavor: flavors[0] ?? current.flavor,
          }
        : {}),
      ...(englishName !== undefined
        ? { englishName, slug: this.generateSlug(englishName, slug) }
        : {}),
      ...(tags !== undefined ? { tags: this.normalizeTags(tags) } : {}),
      ...(mainImage !== undefined
        ? { mainImage: mainImage.trim() || "/images/product.png" }
        : {}),
      ...(galleryImages
        ? { galleryImages: this.normalizeImages(galleryImages) }
        : {}),
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

  private toCategory(category: string) {
    const exists = this.database.db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.slug, category.trim()))
      .get();
    if (!exists) {
      throw new BadRequestException("دسته‌بندی انتخاب‌شده معتبر نیست.");
    }
    return exists.slug;
  }

  private generateSlug(englishName: string, currentSlug?: string) {
    const base =
      englishName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product";
    let candidate = base;
    let suffix = 2;
    while (
      candidate !== currentSlug &&
      this.database.db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.slug, candidate))
        .get()
    ) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }

  private toProductType(value?: string | null) {
    const normalized = value?.trim() || "powder";
    if (!productTypes.includes(normalized as (typeof productTypes)[number])) {
      throw new BadRequestException(
        `نوع محصول باید یکی از این موارد باشد: ${productTypes.join(", ")}`,
      );
    }
    return normalized as (typeof productTypes)[number];
  }

  private toFlavor(value: string | undefined | null, productType: string) {
    const flavor = value?.trim() ?? "";
    if (productType === "powder" && !flavor) {
      throw new BadRequestException("برای محصول پودری انتخاب طعم الزامی است.");
    }
    return flavor;
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
      tags: parseList(product.tags, []),
      brands: parseList(product.brands, product.brand ? [product.brand] : []),
      flavors: parseList(
        product.flavors,
        product.flavor ? [product.flavor] : [],
      ),
      features: parseList(product.features, []),
      galleryImages: parseList(product.galleryImages, ["/images/product.png"]),
      mainImage: product.mainImage ?? "/images/product.png",
      images: parseList(product.galleryImages, [
        product.mainImage ?? "/images/product.png",
      ]),
      name: product.persianName,
      tagline: product.englishName,
      productType: product.productType ?? "powder",
      quantity: "1",
    };
  }

  private normalizeNames(values?: string[], fallback?: string) {
    return [
      ...new Set(
        (values?.length ? values : fallback ? [fallback] : [])
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];
  }
}
