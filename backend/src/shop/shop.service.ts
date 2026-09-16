import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../db/database.service";
import { calculateCartTotal, calculateLineTotal } from "./pricing";

type ProductRecord = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: string;
  category: string;
  productType?: string | null;
  tags?: string | null;
  price: string;
  weight: string;
  quantity: string;
  stock: number;
  images: string;
  createdAt: string;
  updatedAt: string;
};

type CartRecord = {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
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
  features: string;
  category: string;
  productType?: string | null;
  tags?: string | null;
  price: string;
  weight: string;
  productQuantity: string;
  stock: number;
  images: string;
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

@Injectable()
export class ShopService {
  constructor(private readonly database: DatabaseService) {}

  getCart(userId: number) {
    const cart = this.findOrCreateCart(userId);
    return this.buildCart(cart.id);
  }

  addCartItem(userId: number, productSlug: string, quantity: number) {
    const requestedQuantity = this.normalizeQuantity(quantity);
    const product = this.findProductBySlug(productSlug);
    const cart = this.findOrCreateCart(userId);
    const existing = this.sqlite
      .prepare(
        "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      )
      .get(cart.id, product.id) as { id: number; quantity: number } | undefined;
    const nextQuantity = (existing?.quantity ?? 0) + requestedQuantity;
    this.assertStock(product, nextQuantity);
    const now = new Date().toISOString();

    if (existing) {
      this.sqlite
        .prepare(
          "UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?",
        )
        .run(nextQuantity, now, existing.id);
    } else {
      this.sqlite
        .prepare(
          `INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(cart.id, product.id, requestedQuantity, now, now);
    }

    return this.touchAndBuildCart(cart.id);
  }

  updateCartItem(userId: number, itemId: number, quantity: number) {
    const cart = this.findOrCreateCart(userId);
    const item = this.sqlite
      .prepare(
        `SELECT ci.id, ci.product_id, p.stock
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.id = ? AND ci.cart_id = ?`,
      )
      .get(itemId, cart.id) as
      | { id: number; product_id: number; stock: number }
      | undefined;
    if (!item) throw new NotFoundException("Cart item was not found.");

    if (quantity <= 0) {
      this.sqlite.prepare("DELETE FROM cart_items WHERE id = ?").run(itemId);
      return this.touchAndBuildCart(cart.id);
    }

    this.assertStock({ stock: item.stock, name: "Product" }, quantity);
    this.sqlite
      .prepare(
        "UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?",
      )
      .run(Math.floor(quantity), new Date().toISOString(), itemId);
    return this.touchAndBuildCart(cart.id);
  }

  removeCartItem(userId: number, itemId: number) {
    const cart = this.findOrCreateCart(userId);
    this.sqlite
      .prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?")
      .run(itemId, cart.id);
    return this.touchAndBuildCart(cart.id);
  }

  clearCart(userId: number) {
    const cart = this.findOrCreateCart(userId);
    this.sqlite
      .prepare("DELETE FROM cart_items WHERE cart_id = ?")
      .run(cart.id);
    return this.touchAndBuildCart(cart.id);
  }

  createOrderFromCart(userId: number) {
    const cart = this.findOrCreateCart(userId);
    const builtCart = this.buildCart(cart.id);
    if (builtCart.items.length === 0) {
      throw new BadRequestException("Cart is empty.");
    }

    const now = new Date().toISOString();
    const transaction = this.sqlite.transaction(() => {
      for (const item of builtCart.items) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `${item.product.name} does not have enough stock.`,
          );
        }
      }

      const order = this.sqlite
        .prepare(
          `INSERT INTO orders (user_id, status, total, created_at, updated_at)
           VALUES (?, 'pending', ?, ?, ?) RETURNING id, status, total, created_at`,
        )
        .get(userId, builtCart.total, now, now) as OrderRecord;

      for (const item of builtCart.items) {
        this.sqlite
          .prepare(
            `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, total)
             VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .run(
            order.id,
            Number(item.product.id),
            item.product.name,
            item.product.price,
            item.quantity,
            item.lineTotal,
          );
        this.sqlite
          .prepare(
            "UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?",
          )
          .run(item.quantity, now, Number(item.product.id));
      }

      this.sqlite
        .prepare("DELETE FROM cart_items WHERE cart_id = ?")
        .run(cart.id);
      this.sqlite
        .prepare("UPDATE carts SET updated_at = ? WHERE id = ?")
        .run(now, cart.id);

      return order;
    });

    return this.buildOrder(transaction());
  }

  getOrders(userId: number) {
    const rows = this.sqlite
      .prepare(
        "SELECT id, status, total, created_at FROM orders WHERE user_id = ? ORDER BY id DESC",
      )
      .all(userId) as OrderRecord[];
    return rows.map((order) => this.buildOrder(order));
  }

  private buildCart(cartId: number) {
    const rows = this.sqlite
      .prepare(
        `SELECT
          ci.id,
          ci.quantity,
          p.id AS product_id,
          p.slug,
          p.persian_name AS name,
          p.english_name AS tagline,
          p.summary,
          p.description,
          p.features,
          p.category,
          COALESCE(p.tags, '[]') AS tags,
          p.price,
          p.weight,
          '1' AS productQuantity,
          p.stock,
          p.main_image AS images,
          p.created_at AS createdAt,
          p.updated_at AS updatedAt
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.cart_id = ?
        ORDER BY ci.id DESC`,
      )
      .all(cartId) as CartItemRecord[];

    const items = rows.map((row) => {
      const product = this.mapProduct(row);
      return {
        id: row.id,
        quantity: row.quantity,
        lineTotal: calculateLineTotal(product.price, row.quantity),
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

  private buildOrder(order: OrderRecord) {
    const rows = this.sqlite
      .prepare(
        `SELECT id, product_id, product_name, unit_price, quantity, total
         FROM order_items
         WHERE order_id = ?
         ORDER BY id ASC`,
      )
      .all(order.id) as OrderItemRecord[];

    return {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      items: rows.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        total: item.total,
      })),
    };
  }

  private findOrCreateCart(userId: number): CartRecord {
    const existing = this.sqlite
      .prepare(
        "SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = ?",
      )
      .get(userId) as CartRecord | undefined;
    if (existing) return existing;

    const now = new Date().toISOString();
    return this.sqlite
      .prepare(
        `INSERT INTO carts (user_id, created_at, updated_at)
         VALUES (?, ?, ?) RETURNING id, user_id, created_at, updated_at`,
      )
      .get(userId, now, now) as CartRecord;
  }

  private findProductBySlug(slug: string): ProductRecord {
    const product = this.sqlite
      .prepare(
        `SELECT
          id, slug, persian_name AS name, english_name AS tagline, summary, description, features, category,
          COALESCE(tags, '[]') AS tags,
          price, weight, '1' AS quantity, stock, main_image AS images, created_at AS createdAt,
          updated_at AS updatedAt
         FROM products WHERE slug = ?`,
      )
      .get(slug) as ProductRecord | undefined;
    if (!product) throw new NotFoundException("Product was not found.");
    return product;
  }

  private touchAndBuildCart(cartId: number) {
    this.sqlite
      .prepare("UPDATE carts SET updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), cartId);
    return this.buildCart(cartId);
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
      features: this.parseJson<string[]>(row.features, []),
      category: row.category,
      productType: row.productType ?? "powder",
      tags: this.parseJson<string[]>(row.tags ?? "[]", []),
      price: row.price,
      weight: row.weight,
      quantity: "productQuantity" in row ? row.productQuantity : row.quantity,
      stock: row.stock,
      images: this.parseJson<string[]>(row.images, ["/images/product.png"]),
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

  private parseJson<T>(value: string, fallback: T): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private get sqlite() {
    return this.database["sqlite"];
  }
}
