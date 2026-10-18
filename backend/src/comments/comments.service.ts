import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import {
  CommentRow,
  commentVotes,
  comments,
  products,
  replies,
  users,
} from "../db/schema";
import { CreateCommentInput } from "./comment.input";
import {
  Comment,
  CommentStatus,
  ProductReviews,
  VoteType,
} from "./comment.model";

const MAX_CONTENT_LENGTH = 2000;

interface CommentWithMeta {
  comment: CommentRow;
  userName: string;
  productSlug: string;
  productName: string;
}

/** A Drizzle db handle: either the base connection or a transaction (`tx`). */
type Db = DatabaseService["db"];

/**
 * Comments, admin replies and votes. Every write that touches more than one
 * table runs in an async Drizzle transaction (`db.transaction(async (tx) => ...)`),
 * with every statement inside the callback using `tx` so it is part of that
 * transaction.
 */
@Injectable()
export class CommentsService {
  constructor(private readonly database: DatabaseService) {}

  async findByProduct(
    productSlug: string,
    viewerId: number | null,
  ): Promise<ProductReviews> {
    const product = await this.requireProductBySlug(productSlug);
    const rows = await this.selectWithMeta()
      .where(eq(comments.productId, product.id))
      .orderBy(desc(comments.createdAt), desc(comments.id));

    return {
      ...(await this.ratingSummary(product.id)),
      comments: await this.hydrate(rows, viewerId),
    };
  }

  async findAllForAdmin(adminId: number, status?: CommentStatus) {
    const rows = await this.selectWithMeta().where(
      status ? eq(comments.status, status) : undefined,
    ).orderBy(desc(comments.createdAt), desc(comments.id));
    return this.hydrate(rows, adminId);
  }

  async create(userId: number, input: CreateCommentInput) {
    const content = this.cleanContent(input.content);
    if (
      !Number.isInteger(input.rating) ||
      input.rating < 1 ||
      input.rating > 5
    ) {
      throw new BadRequestException("امتیاز باید عددی صحیح بین ۱ تا ۵ باشد.");
    }
    const product = await this.requireProductBySlug(input.productSlug);

    const id = await this.database.db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: comments.id })
        .from(comments)
        .where(
          and(eq(comments.userId, userId), eq(comments.productId, product.id)),
        )
        .then((rows) => rows[0]);
      if (existing) {
        throw new BadRequestException(
          "شما قبلاً برای این محصول نظر ثبت کرده‌اید.",
        );
      }

      const now = new Date().toISOString();
      const [created] = await tx
        .insert(comments)
        .values({
          userId,
          productId: product.id,
          content,
          rating: input.rating,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: comments.id });
      await this.syncProductRating(tx, product.id);
      return created.id;
    });

    return this.findOne(id, userId);
  }

  /** Like, dislike, remove a vote, or switch it: one rule for all four cases. */
  async vote(userId: number, commentId: number, type: VoteType) {
    await this.requireComment(commentId);

    await this.database.db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(commentVotes)
        .where(
          and(
            eq(commentVotes.commentId, commentId),
            eq(commentVotes.userId, userId),
          ),
        )
        .then((rows) => rows[0]);
      const now = new Date().toISOString();

      if (!existing) {
        await tx
          .insert(commentVotes)
          .values({ commentId, userId, type, createdAt: now, updatedAt: now });
      } else if (existing.type === type) {
        await tx.delete(commentVotes).where(eq(commentVotes.id, existing.id));
      } else {
        await tx
          .update(commentVotes)
          .set({ type, updatedAt: now })
          .where(eq(commentVotes.id, existing.id));
      }
    });

    return this.findOne(commentId, userId);
  }

  async reply(adminId: number, commentId: number, content: string) {
    const text = this.cleanContent(content);
    await this.requireComment(commentId);

    await this.database.db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: replies.id })
        .from(replies)
        .where(eq(replies.commentId, commentId))
        .then((rows) => rows[0]);
      if (existing) {
        throw new BadRequestException("این نظر قبلاً پاسخ داده شده است.");
      }

      const now = new Date().toISOString();
      await tx.insert(replies).values({
        commentId,
        adminId,
        content: text,
        createdAt: now,
        updatedAt: now,
      });
      await tx
        .update(comments)
        .set({ status: CommentStatus.ANSWERED })
        .where(eq(comments.id, commentId));
    });

    return this.findOne(commentId, adminId);
  }

  async update(adminId: number, commentId: number, content: string) {
    const text = this.cleanContent(content);
    await this.requireComment(commentId);

    await this.database.db
      .update(comments)
      .set({
        content: text,
        editedByAdmin: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(comments.id, commentId));

    return this.findOne(commentId, adminId);
  }

  /** Replies and votes are removed by ON DELETE CASCADE. */
  async remove(adminId: number, commentId: number) {
    const row = await this.requireComment(commentId);
    const [removed] = await this.hydrate([row], adminId);

    await this.database.db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.id, commentId));
      await this.syncProductRating(tx, row.comment.productId);
    });

    return removed;
  }

  /** Comments are the single source of truth for `products.rating` / `review_count`. */
  private async syncProductRating(db: Db, productId: number) {
    const { average, count: total } = await this.ratingSummary(
      productId,
      db,
    );
    await db
      .update(products)
      .set({ rating: average, reviewCount: total })
      .where(eq(products.id, productId));
  }

  private async ratingSummary(productId: number, db: Db = this.database.db) {
    const rows = await db
      .select({ rating: comments.rating, total: count() })
      .from(comments)
      .where(eq(comments.productId, productId))
      .groupBy(comments.rating);

    const distribution = [0, 0, 0, 0, 0];
    let sum = 0;
    let total = 0;
    for (const row of rows) {
      distribution[row.rating - 1] = row.total;
      sum += row.rating * row.total;
      total += row.total;
    }
    return {
      average: total ? Math.round((sum / total) * 10) / 10 : 0,
      count: total,
      distribution,
    };
  }

  private selectWithMeta() {
    return this.database.db
      .select({
        comment: comments,
        userName: users.name,
        productSlug: products.slug,
        productName: products.persianName,
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.userId))
      .innerJoin(products, eq(products.id, comments.productId));
  }

  /** Loads likes, dislikes, the viewer's vote and the reply for many comments at once. */
  private async hydrate(
    rows: CommentWithMeta[],
    viewerId: number | null,
  ): Promise<Comment[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.comment.id);
    const db = this.database.db;

    const voteRows = await db
      .select({
        commentId: commentVotes.commentId,
        type: commentVotes.type,
        total: count(),
      })
      .from(commentVotes)
      .where(inArray(commentVotes.commentId, ids))
      .groupBy(commentVotes.commentId, commentVotes.type);
    const myVoteRows =
      viewerId === null
        ? []
        : await db
            .select({ commentId: commentVotes.commentId, type: commentVotes.type })
            .from(commentVotes)
            .where(
              and(
                inArray(commentVotes.commentId, ids),
                eq(commentVotes.userId, viewerId),
              ),
            );
    const replyRows = await db
      .select({ reply: replies, adminName: users.name })
      .from(replies)
      .innerJoin(users, eq(users.id, replies.adminId))
      .where(inArray(replies.commentId, ids));

    const counts = new Map<string, number>();
    for (const row of voteRows) {
      counts.set(`${row.commentId}:${row.type}`, row.total);
    }
    const myVotes = new Map(myVoteRows.map((row) => [row.commentId, row.type]));
    const repliesByComment = new Map(
      replyRows.map((row) => [row.reply.commentId, row]),
    );

    return rows.map(({ comment, userName, productSlug, productName }) => {
      const replyRow = repliesByComment.get(comment.id);
      return {
        id: comment.id,
        userName,
        rating: comment.rating,
        content: comment.content,
        status: comment.status as CommentStatus,
        editedByAdmin: comment.editedByAdmin,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likeCount: counts.get(`${comment.id}:LIKE`) ?? 0,
        dislikeCount: counts.get(`${comment.id}:DISLIKE`) ?? 0,
        myVote: myVotes.get(comment.id) as VoteType | undefined,
        reply: replyRow && {
          id: replyRow.reply.id,
          content: replyRow.reply.content,
          adminName: replyRow.adminName,
          createdAt: replyRow.reply.createdAt,
          updatedAt: replyRow.reply.updatedAt,
        },
        productSlug,
        productName,
      };
    });
  }

  private async findOne(commentId: number, viewerId: number | null) {
    const row = await this.requireComment(commentId);
    return (await this.hydrate([row], viewerId))[0];
  }

  private async requireComment(commentId: number) {
    const row = await this.selectWithMeta()
      .where(eq(comments.id, commentId))
      .then((rows) => rows[0]);
    if (!row) throw new NotFoundException("نظر پیدا نشد.");
    return row;
  }

  private async requireProductBySlug(slug: string) {
    const product = await this.database.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .then((rows) => rows[0]);
    if (!product) throw new NotFoundException("محصول پیدا نشد.");
    return product;
  }

  private cleanContent(value: string) {
    const content = value?.trim();
    if (!content) throw new BadRequestException("متن نظر الزامی است.");
    if (content.length > MAX_CONTENT_LENGTH) {
      throw new BadRequestException(
        `متن نظر نباید بیشتر از ${MAX_CONTENT_LENGTH} کاراکتر باشد.`,
      );
    }
    return content;
  }
}
