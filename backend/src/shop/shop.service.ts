import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import {
  cartItems,
  carts,
  orderItems,
  orders,
  products,
} from "../db/schema";
import { calculateCartTotal, calculateLineTotal } from "./pricing";

type ProductRecord = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: unknown;
  category: string;
  productType?: string | null;
  tags?: unknown;
  price: string;
  weight: string;
  quantity: string;
  stock: number;
  images: unknown;
  createdAt: string;
  updatedAt: string;
};

type CartItemRecord = {
  id: number;
  quantity: number;
  product_id: number;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: unknown;
  category: string;
  productType?: string | null;
  tags?: unknown;
  price: string;
  weight: string;
  productQuantity: string;
  stock: number;
  images: unknown;
  createdAt: string;
  updatedAt: string;
};

type OrderRecord = {
  id: number;
  status: string;
  total: string;
  created_at: string;
};

type OrderItemRecord = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  total: string;
};

/** A Drizzle db handle: either the base connection or a transaction (`tx`). */
type Db = DatabaseService["db"];

@Injectable()
export class ShopService {
  constructor(private readonly database: DatabaseService) {}

  async getCart(userId: number) {
    const cart = await this.findOrCreateCart(this.database.db, userId);
    return this.buildCart(this.database.db, cart.id);
  }

  async addCartItem(userId: number, productSlug: string, quantity: number) {
    const requestedQuantity = this.normalizeQuantity(quantity);
    const db = this.database.db;
    const product = await this.findProductBySlug(db, productSlug);
    const cart = await this.findOrCreateCart(db, userId);
    const existing = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, product.id)),
      )
      .then((rows) => rows[0] as { id: number; quantity: number } | undefined);
    const nextQuantity = (existing?.quantity ?? 0) + requestedQuantity;
    this.assertStock(product, nextQuantity);
    const now = new Date().toISOString();

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: nextQuantity, updatedAt: now })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: product.id,
        quantity: requestedQuantity,
        createdAt: now,
        updatedAt: now,
      });
    }

    return this.touchAndBuildCart(db, cart.id);
  }

  async updateCartItem(userId: number, itemId: number, quantity: number) {
    const db = this.database.db;
    const cart = await this.findOrCreateCart(db, userId);
    const item = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        stock: products.stock,
      })
      .from(cartItems)
      .innerJoin(products, eq(products.id, cartItems.productId))
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .then(
        (rows) =>
          rows[0] as
            | { id: number; productId: number; stock: number }
            | undefined,
      );
    if (!item) throw new NotFoundException("Cart item was not found.");

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
      return this.touchAndBuildCart(db, cart.id);
    }

    this.assertStock({ stock: item.stock, name: "Product" }, quantity);
    await db
      .update(cartItems)
      .set({ quantity: Math.floor(quantity), updatedAt: new Date().toISOString() })
      .where(eq(cartItems.id, itemId));
    return this.touchAndBuildCart(db, cart.id);
  }

  async removeCartItem(userId: number, itemId: number) {
    const db = this.database.db;
    const cart = await this.findOrCreateCart(db, userId);
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
    return this.touchAndBuildCart(db, cart.id);
  }

  async clearCart(userId: number) {
    const db = this.database.db;
    const cart = await this.findOrCreateCart(db, userId);
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return this.touchAndBuildCart(db, cart.id);
  }

  async createOrderFromCart(userId: number) {
    const db = this.database.db;
    const cart = await this.findOrCreateCart(db, userId);
    const builtCart = await this.buildCart(db, cart.id);
    if (builtCart.items.length === 0) {
      throw new BadRequestException("Cart is empty.");
    }

    const now = new Date().toISOString();

    const order = await this.database.db.transaction(async (tx) => {
      for (const item of builtCart.items) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `${item.product.name} does not have enough stock.`,
          );
        }
      }

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          userId,
          status: "pending",
          total: builtCart.total,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: orders.id,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
        });
      const orderRecord: OrderRecord = {
        id: createdOrder.id,
        status: createdOrder.status,
        total: createdOrder.total,
        created_at: createdOrder.createdAt,
      };

      for (const item of builtCart.items) {
        await tx.insert(orderItems).values({
          orderId: orderRecord.id,
          productId: Number(item.product.id),
          productName: item.product.name,
          unitPrice: item.product.price,
          quantity: item.quantity,
          total: item.lineTotal,
        });
        await tx
          .update(products)
          .set({
            stock: item.product.stock - item.quantity,
            updatedAt: now,
          })
          .where(eq(products.id, Number(item.product.id)));
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      await tx
        .update(carts)
        .set({ updatedAt: now })
        .where(eq(carts.id, cart.id));

      return orderRecord;
    });

    return this.buildOrder(db, order);
  }

  async getOrders(userId: number) {
    const db = this.database.db;
    const rows = await db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.id));
    const ordered = rows.map((row) => ({
        id: row.id,
        status: row.status,
        total: row.total,
        created_at: row.createdAt,
      }));
    return Promise.all(ordered.map((order) => this.buildOrder(db, order)));
  }

  private async buildCart(db: Db, cartId: number) {
    const rows = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        product_id: products.id,
        slug: products.slug,
        name: products.persianName,
        tagline: products.englishName,
        summary: products.summary,
        description: products.description,
        features: products.features,
        category: products.category,
        productType: products.productType,
        tags: products.tags,
        price: products.price,
        weight: products.weight,
        stock: products.stock,
        images: products.mainImage,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(cartItems)
      .innerJoin(products, eq(products.id, cartItems.productId))
      .where(eq(cartItems.cartId, cartId))
      .orderBy(desc(cartItems.id));

    const orderedRows = rows as unknown as (Omit<
      CartItemRecord,
      "productQuantity"
    > & { productQuantity?: string })[];

    const items = orderedRows.map((row) => {
      const record: CartItemRecord = { ...row, productQuantity: "1" } as CartItemRecord;
      const product = this.mapProduct(record);
      return {
        id: record.id,
        quantity: record.quantity,
        lineTotal: calculateLineTotal(product.price, record.quantity),
        product,
      };
    });

    return {
      id: cartId,
      items,
      total: calculateCartTotal(items),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  private async buildOrder(db: Db, order: OrderRecord) {
    const rows = await db
      .select({
        id: orderItems.id,
        product_id: orderItems.productId,
        product_name: orderItems.productName,
        unit_price: orderItems.unitPrice,
        quantity: orderItems.quantity,
        total: orderItems.total,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(orderItems.id);
    const items = rows as unknown as OrderItemRecord[];

    return {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      items: items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        total: item.total,
      })),
    };
  }

  private async findOrCreateCart(db: Db, userId: number) {
    const existing = await db
      .select({
        id: carts.id,
        user_id: carts.userId,
        created_at: carts.createdAt,
        updated_at: carts.updatedAt,
      })
      .from(carts)
      .where(eq(carts.userId, userId))
      .then((rows) => rows[0]);
    if (existing) return existing;

    const now = new Date().toISOString();
    const [created] = await db
      .insert(carts)
      .values({ userId, createdAt: now, updatedAt: now })
      .returning({
        id: carts.id,
        user_id: carts.userId,
        created_at: carts.createdAt,
        updated_at: carts.updatedAt,
      });
    return created;
  }

  private async findProductBySlug(db: Db, slug: string) {
    const product = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.persianName,
        tagline: products.englishName,
        summary: products.summary,
        description: products.description,
        features: products.features,
        category: products.category,
        productType: products.productType,
        tags: products.tags,
        price: products.price,
        weight: products.weight,
        stock: products.stock,
        images: products.mainImage,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.slug, slug))
      .then((rows) => rows[0]);
    if (!product) throw new NotFoundException("Product was not found.");
    return { ...product, quantity: "1" } as ProductRecord;
  }

  private async touchAndBuildCart(db: Db, cartId: number) {
    await db
      .update(carts)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(carts.id, cartId));
    return this.buildCart(db, cartId);
  }

  private mapProduct(row: CartItemRecord | ProductRecord) {
    return {
      id:
        row instanceof Object && "product_id" in row ? row.product_id : row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      summary: row.summary,
      description: row.description,
      features: this.asList(row.features, []),
      category: row.category,
      productType: row.productType ?? "powder",
      tags: this.asList(row.tags ?? [], []),
      price: row.price,
      weight: row.weight,
      quantity: "productQuantity" in row ? row.productQuantity : row.quantity,
      stock: row.stock,
      images: this.asList(row.images, ["/images/product.png"]),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private normalizeQuantity(quantity: number) {
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new BadRequestException("Quantity must be at least 1.");
    }
    return Math.floor(quantity);
  }

  private assertStock(
    product: { stock: number; name: string },
    quantity: number,
  ) {
    if (product.stock < quantity) {
      throw new BadRequestException(
        `${product.name} does not have enough stock.`,
      );
    }
  }

  /** `features`/`tags`/`images` come back from jsonb columns already parsed as arrays. */
  private asList<T>(value: unknown, fallback: T): T {
    if (Array.isArray(value)) return value as unknown as T;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as unknown as T) : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}
