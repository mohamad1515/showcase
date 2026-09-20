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

/**
 * Comments, admin replies and votes. Every write that touches more than one
 * table runs in a transaction. better-sqlite3 has a single connection, so all
 * statements executed inside a transaction callback belong to that transaction.
 */
@Injectable()
export class CommentsService {
  constructor(private readonly database: DatabaseService) {}

  findByProduct(
    productSlug: string,
    viewerId: number | null,
  ): ProductReviews {
    const product = this.requireProductBySlug(productSlug);
    const rows = this.selectWithMeta()
      .where(eq(comments.productId, product.id))
      .orderBy(desc(comments.createdAt), desc(comments.id))
      .all();

    return {
      ...this.ratingSummary(product.id),
      comments: this.hydrate(rows, viewerId),
    };
  }

  findAllForAdmin(adminId: number, status?: CommentStatus) {
    const rows = this.selectWithMeta()
      .where(status ? eq(comments.status, status) : undefined)
      .orderBy(desc(comments.createdAt), desc(comments.id))
      .all();
    return this.hydrate(rows, adminId);
  }

  create(userId: number, input: CreateCommentInput) {
    const content = this.cleanContent(input.content);
    if (
      !Number.isInteger(input.rating) ||
      input.rating < 1 ||
      input.rating > 5
    ) {
      throw new BadRequestException("امتیاز باید عددی صحیح بین ۱ تا ۵ باشد.");
    }
    const product = this.requireProductBySlug(input.productSlug);

    const id = this.database.db.transaction(() => {
      const existing = this.database.db
        .select({ id: comments.id })
        .from(comments)
        .where(
          and(eq(comments.userId, userId), eq(comments.productId, product.id)),
        )
        .get();
      if (existing) {
        throw new BadRequestException(
          "شما قبلاً برای این محصول نظر ثبت کرده‌اید.",
        );
      }

      const now = new Date().toISOString();
      const created = this.database.db
        .insert(comments)
        .values({
          userId,
          productId: product.id,
          content,
          rating: input.rating,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: comments.id })
        .get();
      this.syncProductRating(product.id);
      return created.id;
    });

    return this.findOne(id, userId);
  }

  /** Like, dislike, remove a vote, or switch it: one rule for all four cases. */
  vote(userId: number, commentId: number, type: VoteType) {
    this.requireComment(commentId);

    this.database.db.transaction(() => {
      const existing = this.database.db
        .select()
        .from(commentVotes)
        .where(
          and(
            eq(commentVotes.commentId, commentId),
            eq(commentVotes.userId, userId),
          ),
        )
        .get();
      const now = new Date().toISOString();

      if (!existing) {
        this.database.db
          .insert(commentVotes)
          .values({ commentId, userId, type, createdAt: now, updatedAt: now })
          .run();
      } else if (existing.type === type) {
        this.database.db
          .delete(commentVotes)
          .where(eq(commentVotes.id, existing.id))
          .run();
      } else {
        this.database.db
          .update(commentVotes)
          .set({ type, updatedAt: now })
          .where(eq(commentVotes.id, existing.id))
          .run();
      }
    });

    return this.findOne(commentId, userId);
  }

  reply(adminId: number, commentId: number, content: string) {
    const text = this.cleanContent(content);
    this.requireComment(commentId);

    this.database.db.transaction(() => {
      const existing = this.database.db
        .select({ id: replies.id })
        .from(replies)
        .where(eq(replies.commentId, commentId))
        .get();
      if (existing) {
        throw new BadRequestException("این نظر قبلاً پاسخ داده شده است.");
      }

      const now = new Date().toISOString();
      this.database.db
        .insert(replies)
        .values({
          commentId,
          adminId,
          content: text,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      this.database.db
        .update(comments)
        .set({ status: CommentStatus.ANSWERED })
        .where(eq(comments.id, commentId))
        .run();
    });

    return this.findOne(commentId, adminId);
  }

  update(adminId: number, commentId: number, content: string) {
    const text = this.cleanContent(content);
    this.requireComment(commentId);

    this.database.db
      .update(comments)
      .set({
        content: text,
        editedByAdmin: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(comments.id, commentId))
      .run();

    return this.findOne(commentId, adminId);
  }

  /** Replies and votes are removed by ON DELETE CASCADE. */
  remove(adminId: number, commentId: number) {
    const row = this.requireComment(commentId);
    const [removed] = this.hydrate([row], adminId);

    this.database.db.transaction(() => {
      this.database.db.delete(comments).where(eq(comments.id, commentId)).run();
      this.syncProductRating(row.comment.productId);
    });

    return removed;
  }

  /** Comments are the single source of truth for `products.rating` / `review_count`. */
  private syncProductRating(productId: number) {
    const { average, count: total } = this.ratingSummary(productId);
    this.database.db
      .update(products)
      .set({ rating: average, reviewCount: total })
      .where(eq(products.id, productId))
      .run();
  }

  private ratingSummary(productId: number) {
    const rows = this.database.db
      .select({ rating: comments.rating, total: count() })
      .from(comments)
      .where(eq(comments.productId, productId))
      .groupBy(comments.rating)
      .all();

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
  private hydrate(rows: CommentWithMeta[], viewerId: number | null): Comment[] {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.comment.id);
    const db = this.database.db;

    const voteRows = db
      .select({
        commentId: commentVotes.commentId,
        type: commentVotes.type,
        total: count(),
      })
      .from(commentVotes)
      .where(inArray(commentVotes.commentId, ids))
      .groupBy(commentVotes.commentId, commentVotes.type)
      .all();
    const myVoteRows =
      viewerId === null
        ? []
        : db
            .select({ commentId: commentVotes.commentId, type: commentVotes.type })
            .from(commentVotes)
            .where(
              and(
                inArray(commentVotes.commentId, ids),
                eq(commentVotes.userId, viewerId),
              ),
            )
            .all();
    const replyRows = db
      .select({ reply: replies, adminName: users.name })
      .from(replies)
      .innerJoin(users, eq(users.id, replies.adminId))
      .where(inArray(replies.commentId, ids))
      .all();

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

  private findOne(commentId: number, viewerId: number | null) {
    return this.hydrate([this.requireComment(commentId)], viewerId)[0];
  }

  private requireComment(commentId: number) {
    const row = this.selectWithMeta()
      .where(eq(comments.id, commentId))
      .get();
    if (!row) throw new NotFoundException("نظر پیدا نشد.");
    return row;
  }

  private requireProductBySlug(slug: string) {
    const product = this.database.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .get();
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
