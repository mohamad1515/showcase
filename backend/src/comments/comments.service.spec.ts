// The database and session services read their configuration from the
// environment when constructed, so set it before creating anything.
//
// Postgres has no `:memory:` equivalent, so these tests run against a real
// local Postgres (the `postgres` service in ../../docker-compose.yml —
// `docker compose up -d postgres` from the `showcase/` root first) using a
// dedicated database (`showcase_test` by default), created automatically if
// it does not exist yet. Set TEST_DATABASE_URL to point elsewhere (e.g. a
// different host/port/credentials); TEST_MAINTENANCE_DATABASE_URL is the
// connection used only to issue `CREATE DATABASE` (defaults to the same
// server/credentials, database `your_username`'s own "your_database", which
// docker-compose always creates).
const MAINTENANCE_DATABASE_URL =
  process.env.TEST_MAINTENANCE_DATABASE_URL ??
  "postgresql://your_username:your_password@localhost:5432/your_database";
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://your_username:your_password@localhost:5432/showcase_test";

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = "test-secret-with-enough-length-0123456789";

import test from "node:test";
import assert from "node:assert/strict";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { count, eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import type { Request } from "express";
import { SessionService } from "../auth/session.service";
import { DatabaseService } from "../db/database.service";
import {
  commentVotes,
  comments,
  products,
  replies,
  users,
} from "../db/schema";
import { UserService } from "../user/user.service";
import { CommentStatus, VoteType } from "./comment.model";
import { CommentsResolver } from "./comments.resolver";
import { CommentsService } from "./comments.service";

/** Creates the dedicated test database once per test run, if it is missing. */
let ensured: Promise<void> | null = null;
function ensureTestDatabase() {
  if (!ensured) ensured = createTestDatabaseIfMissing();
  return ensured;
}

async function createTestDatabaseIfMissing() {
  const dbName = new URL(TEST_DATABASE_URL).pathname.replace(/^\//, "");
  const maintenance = new Pool({ connectionString: MAINTENANCE_DATABASE_URL });
  try {
    const { rows } = await maintenance.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (rows.length === 0) {
      // Database names cannot be parameterized; dbName comes from our own
      // TEST_DATABASE_URL / env var, not request input.
      await maintenance.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await maintenance.end();
  }
}

/**
 * Builds a fresh-looking database for one test: tables are created once and
 * reused across the whole run (CREATE TABLE IF NOT EXISTS is idempotent),
 * but every mutable table touched by these tests is truncated and the
 * baseline seed (the admin user) is restored before each test runs.
 */
async function setup(t: test.TestContext) {
  await ensureTestDatabase();

  const database = new DatabaseService();
  await database.onModuleInit();
  t.after(() => database.onModuleDestroy());

  await database.db.execute(
    sql`TRUNCATE TABLE comments, replies, comment_votes, users, products RESTART IDENTITY CASCADE`,
  );
  // users/products were wiped, so re-run the boot seed to restore the admin
  // account (categories/sliders are untouched and the insert is a no-op).
  await database.onModuleInit();

  const db = database.db;
  const now = new Date().toISOString();
  const addUser = async (name: string, isActive = true) => {
    const [row] = await db
      .insert(users)
      .values({
        name,
        email: `${name}@test.dev`,
        providerId: name,
        role: "USER",
        isActive,
        createdAt: now,
      })
      .returning();
    return row;
  };
  const addProduct = async (slug: string) => {
    const [row] = await db
      .insert(products)
      .values({
        slug,
        persianName: slug,
        englishName: slug,
        brand: "B",
        category: "sports-supplements",
        summary: "s",
        description: "d",
        features: [],
        price: "100",
        weight: "1kg",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return row;
  };

  const commentsService = new CommentsService(database);
  const session = new SessionService(new UserService(database));
  const resolver = new CommentsResolver(commentsService, session);
  const table = async (query: Promise<{ n: number }[]>) =>
    (await query)[0]?.n ?? 0;

  const admin = (
    await db.select().from(users).where(eq(users.role, "ADMIN"))
  )[0]!;

  return {
    db,
    admin,
    addUser,
    addProduct,
    commentsService,
    session,
    resolver,
    total: {
      comments: () => table(db.select({ n: count() }).from(comments)),
      replies: () => table(db.select({ n: count() }).from(replies)),
      votes: () => table(db.select({ n: count() }).from(commentVotes)),
    },
    product: async (id: number) =>
      (await db.select().from(products).where(eq(products.id, id)))[0]!,
  };
}

const asRequest = (token?: string) =>
  ({ headers: token ? { authorization: `Bearer ${token}` } : {} }) as unknown as Request;

async function rejects(
  promise: Promise<unknown>,
  type: new (...args: never[]) => Error,
  message?: string,
) {
  await assert.rejects(promise, (error: Error) => {
    assert.ok(error instanceof type, `expected ${type.name}, got ${error.constructor.name}: ${error.message}`);
    if (message) assert.equal(error.message, message);
    return true;
  });
}

test("createComment: author comes from the caller, text is trimmed, status starts UNANSWERED", async (t) => {
  const { commentsService, addUser, addProduct, db } = await setup(t);
  const sara = await addUser("Sara");
  await addProduct("whey");

  const created = await commentsService.create(sara.id, {
    productSlug: "whey",
    rating: 5,
    content: "  great  ",
  });

  assert.equal(created.userName, "Sara");
  assert.equal(created.content, "great");
  assert.equal(created.rating, 5);
  assert.equal(created.status, CommentStatus.UNANSWERED);
  assert.equal(created.editedByAdmin, false);
  assert.equal(created.likeCount, 0);
  assert.equal(created.dislikeCount, 0);
  assert.equal(created.myVote, undefined);
  assert.equal(created.reply, undefined);
  assert.equal(created.productSlug, "whey");
  assert.equal((await db.select().from(comments))[0]!.userId, sara.id);
});

test("createComment: invalid input is rejected and nothing is stored", async (t) => {
  const { commentsService, addUser, addProduct, total } = await setup(t);
  const sara = await addUser("Sara");
  await addProduct("whey");
  const make = (overrides: object) =>
    commentsService.create(sara.id, {
      productSlug: "whey",
      rating: 4,
      content: "ok",
      ...overrides,
    });

  for (const rating of [0, 6, -1, 2.5, Number.NaN]) {
    await rejects(make({ rating }), BadRequestException, undefined);
  }
  await rejects(make({ content: "" }), BadRequestException);
  await rejects(make({ content: "   \n " }), BadRequestException);
  await rejects(make({ content: "x".repeat(2001) }), BadRequestException);
  await rejects(make({ productSlug: "missing" }), NotFoundException);
  assert.equal(await total.comments(), 0);

  await make({ content: "x".repeat(2000) }); // 2000 characters is allowed; throws on failure
});

test("createComment: one review per user per product", async (t) => {
  const { commentsService, addUser, addProduct, total } = await setup(t);
  const [sara, ali] = [await addUser("Sara"), await addUser("Ali")];
  await addProduct("whey");
  await addProduct("creatine");
  const input = { productSlug: "whey", rating: 4, content: "ok" };

  await commentsService.create(sara.id, input);
  await rejects(commentsService.create(sara.id, input), BadRequestException);
  await commentsService.create(ali.id, input); // another user can review
  await commentsService.create(sara.id, { ...input, productSlug: "creatine" }); // same user, another product
  assert.equal(await total.comments(), 3);
});

test("rating summary and products.rating / review_count stay in sync with comments", async (t) => {
  const { commentsService, addUser, addProduct, product, admin } = await setup(t);
  const [a, b, c] = [await addUser("A"), await addUser("B"), await addUser("C")];
  const whey = await addProduct("whey");
  const at = (id: number, rating: number) =>
    commentsService.create(id, { productSlug: "whey", rating, content: "x" });

  assert.deepEqual(
    { rating: (await product(whey.id)).rating, reviews: (await product(whey.id)).reviewCount },
    { rating: 0, reviews: 0 },
  );

  const five = await at(a.id, 5);
  await at(b.id, 4);
  await at(c.id, 4);
  const summary = await commentsService.findByProduct("whey", null);
  assert.equal(summary.count, 3);
  assert.equal(summary.average, 4.3, "13 / 3 rounded to one decimal");
  assert.deepEqual(summary.distribution, [0, 0, 0, 2, 1]);
  assert.equal((await product(whey.id)).rating, 4.3);
  assert.equal((await product(whey.id)).reviewCount, 3);

  await commentsService.remove(admin.id, Number(five.id));
  assert.equal((await product(whey.id)).rating, 4);
  assert.equal((await product(whey.id)).reviewCount, 2);

  for (const row of (await commentsService.findByProduct("whey", null)).comments) {
    await commentsService.remove(admin.id, Number(row.id));
  }
  assert.equal((await product(whey.id)).rating, 0);
  assert.equal((await product(whey.id)).reviewCount, 0);
  assert.equal((await commentsService.findByProduct("whey", null)).average, 0);
});

test("voteComment: one rule for like, dislike, remove and switch; one vote per user", async (t) => {
  const { commentsService, addUser, addProduct, total, admin } = await setup(t);
  const [sara, ali] = [await addUser("Sara"), await addUser("Ali")];
  await addProduct("whey");
  const id = Number(
    (await commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "x" })).id,
  );

  const steps: [VoteType, number, number, VoteType | undefined][] = [
    [VoteType.LIKE, 1, 0, VoteType.LIKE], // none -> like
    [VoteType.LIKE, 0, 0, undefined], // like again -> removed
    [VoteType.DISLIKE, 0, 1, VoteType.DISLIKE], // none -> dislike
    [VoteType.LIKE, 1, 0, VoteType.LIKE], // dislike -> like
    [VoteType.DISLIKE, 0, 1, VoteType.DISLIKE], // like -> dislike
    [VoteType.DISLIKE, 0, 0, undefined], // dislike again -> removed
  ];
  for (const [type, likes, dislikes, mine] of steps) {
    const result = await commentsService.vote(ali.id, id, type);
    assert.deepEqual(
      [result.likeCount, result.dislikeCount, result.myVote],
      [likes, dislikes, mine],
      `after ${type}`,
    );
    assert.ok((await total.votes()) <= 1, "at most one vote row for this user and comment");
  }

  await commentsService.vote(ali.id, id, VoteType.LIKE);
  const both = await commentsService.vote(sara.id, id, VoteType.DISLIKE);
  assert.deepEqual([both.likeCount, both.dislikeCount, both.myVote], [1, 1, VoteType.DISLIKE]);
  const byAdmin = await commentsService.vote(admin.id, id, VoteType.LIKE);
  assert.deepEqual([byAdmin.likeCount, byAdmin.dislikeCount], [2, 1], "admins vote like anyone else");
  assert.equal(await total.votes(), 3);

  await rejects(commentsService.vote(ali.id, 9999, VoteType.LIKE), NotFoundException);
});

test("findByProduct: counts, replies and myVote are per comment and per viewer, newest first", async (t) => {
  const { commentsService, addUser, addProduct, admin } = await setup(t);
  const [a, b, c] = [await addUser("A"), await addUser("B"), await addUser("C")];
  await addProduct("whey");
  const add = async (user: { id: number }, rating: number) =>
    Number((await commentsService.create(user.id, { productSlug: "whey", rating, content: `by ${user.id}` })).id);
  const [first, second, third] = [await add(a, 5), await add(b, 3), await add(c, 1)];

  await commentsService.vote(b.id, first, VoteType.LIKE);
  await commentsService.vote(c.id, first, VoteType.LIKE);
  await commentsService.vote(a.id, second, VoteType.DISLIKE);
  await commentsService.reply(admin.id, second, "answer");

  const view = async (viewer: number | null) =>
    Object.fromEntries(
      (await commentsService.findByProduct("whey", viewer)).comments.map((row) => [row.id, row]),
    );
  const asB = await view(b.id);
  assert.deepEqual([asB[first].likeCount, asB[first].dislikeCount, asB[first].myVote], [2, 0, VoteType.LIKE]);
  assert.deepEqual([asB[second].likeCount, asB[second].dislikeCount, asB[second].myVote], [0, 1, undefined]);
  assert.deepEqual([asB[third].likeCount, asB[third].dislikeCount, asB[third].myVote], [0, 0, undefined]);
  assert.equal(asB[second].reply?.content, "answer");
  assert.equal(asB[second].reply?.adminName, admin.name);
  assert.equal(asB[first].reply, undefined);

  const anonymous = await view(null);
  assert.equal(anonymous[first].likeCount, 2, "anonymous still sees counts");
  assert.equal(anonymous[first].myVote, undefined, "but no personal vote");

  const order = (await commentsService.findByProduct("whey", null)).comments.map((row) => Number(row.id));
  assert.deepEqual(order, [third, second, first], "newest first");
});

test("replyToComment: sets ANSWERED in the same step, one reply only, status filter follows", async (t) => {
  const { commentsService, addUser, addProduct, admin, total } = await setup(t);
  const [sara, ali] = [await addUser("Sara"), await addUser("Ali")];
  await addProduct("whey");
  const first = Number((await commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "x" })).id);
  const second = Number((await commentsService.create(ali.id, { productSlug: "whey", rating: 3, content: "y" })).id);

  const statuses = async (status?: CommentStatus) =>
    (await commentsService.findAllForAdmin(admin.id, status)).map((row) => Number(row.id)).sort();
  assert.deepEqual(
    [(await statuses()).length, (await statuses(CommentStatus.UNANSWERED)).length, (await statuses(CommentStatus.ANSWERED)).length],
    [2, 2, 0],
  );

  const answered = await commentsService.reply(admin.id, first, "  thanks  ");
  assert.equal(answered.status, CommentStatus.ANSWERED);
  assert.equal(answered.reply?.content, "thanks");
  assert.equal(answered.reply?.adminName, admin.name);
  assert.deepEqual(await statuses(CommentStatus.ANSWERED), [first]);
  assert.deepEqual(await statuses(CommentStatus.UNANSWERED), [second]);

  await rejects(commentsService.reply(admin.id, first, "again"), BadRequestException);
  await rejects(commentsService.reply(admin.id, second, "   "), BadRequestException);
  await rejects(commentsService.reply(admin.id, second, "x".repeat(2001)), BadRequestException);
  await rejects(commentsService.reply(admin.id, 9999, "x"), NotFoundException);
  assert.equal(await total.replies(), 1, "failed replies stored nothing");
  assert.equal(
    (await commentsService.findAllForAdmin(admin.id, CommentStatus.UNANSWERED))[0].status,
    CommentStatus.UNANSWERED,
    "a failed reply did not flip the status",
  );
});

test("updateComment: changes the text only and flags it as edited by an admin", async (t) => {
  const { commentsService, addUser, addProduct, admin } = await setup(t);
  const sara = await addUser("Sara");
  await addProduct("whey");
  const created = await commentsService.create(sara.id, { productSlug: "whey", rating: 4, content: "original" });
  await commentsService.reply(admin.id, Number(created.id), "answer");

  const edited = await commentsService.update(admin.id, Number(created.id), "  fixed  ");
  assert.equal(edited.content, "fixed");
  assert.equal(edited.editedByAdmin, true);
  assert.equal(edited.rating, 4);
  assert.equal(edited.userName, "Sara");
  assert.equal(edited.status, CommentStatus.ANSWERED);
  assert.equal(edited.reply?.content, "answer");
  assert.ok(edited.updatedAt >= created.updatedAt, "updatedAt moves forward");
  assert.equal(edited.createdAt, created.createdAt, "createdAt is untouched");

  await rejects(commentsService.update(admin.id, Number(created.id), " "), BadRequestException);
  await rejects(commentsService.update(admin.id, 9999, "x"), NotFoundException);
});

test("removeComment: replies and votes go with it; deleting a product removes its comments", async (t) => {
  const { commentsService, addUser, addProduct, admin, total, db } = await setup(t);
  const [sara, ali] = [await addUser("Sara"), await addUser("Ali")];
  const whey = await addProduct("whey");
  await addProduct("creatine");
  const doomed = Number((await commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "x" })).id);
  const kept = Number((await commentsService.create(ali.id, { productSlug: "whey", rating: 3, content: "y" })).id);
  await commentsService.vote(ali.id, doomed, VoteType.LIKE);
  await commentsService.vote(sara.id, kept, VoteType.LIKE);
  await commentsService.reply(admin.id, doomed, "answer");
  await commentsService.create(ali.id, { productSlug: "creatine", rating: 2, content: "z" });

  const removed = await commentsService.remove(admin.id, doomed);
  assert.equal(Number(removed.id), doomed);
  assert.equal(removed.reply?.content, "answer", "the removed comment is returned in full");
  assert.deepEqual([await total.comments(), await total.replies(), await total.votes()], [2, 0, 1]);
  await rejects(commentsService.remove(admin.id, doomed), NotFoundException);

  await db.delete(products).where(eq(products.id, whey.id));
  assert.equal(await total.comments(), 1, "only the other product's comment remains");
  assert.equal(await total.votes(), 0);
  assert.equal((await commentsService.findByProduct("creatine", null)).count, 1);
  await rejects(commentsService.findByProduct("whey", null), NotFoundException);
});

// ---------------------------------------------------------------------------
// Authorization (raw.md section 11). These go through the resolver, which is where
// the session checks live, using real tokens against a real database.
// ---------------------------------------------------------------------------

async function authSetup(t: test.TestContext) {
  const ctx = await setup(t);
  const sara = await ctx.addUser("Sara");
  const ali = await ctx.addUser("Ali");
  await ctx.addProduct("whey");
  const tokens = {
    admin: ctx.session.signToken(ctx.admin.id),
    sara: ctx.session.signToken(sara.id),
    ali: ctx.session.signToken(ali.id),
  };
  const saraComment = Number(
    (await ctx.commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "original" })).id,
  );
  return { ...ctx, sara, ali, tokens, saraComment };
}

test("authorization: anonymous callers cannot create, vote or use any admin operation", async (t) => {
  const { resolver, saraComment, total } = await authSetup(t);
  const anonymous = asRequest();
  const before = [await total.comments(), await total.replies(), await total.votes()];

  await rejects(resolver.createComment({ productSlug: "whey", rating: 5, content: "x" }, anonymous), UnauthorizedException, "Please sign in first.");
  await rejects(resolver.voteComment(saraComment, VoteType.LIKE, anonymous), UnauthorizedException);
  await rejects(resolver.replyToComment(saraComment, "x", anonymous), UnauthorizedException);
  await rejects(resolver.updateComment(saraComment, "x", anonymous), UnauthorizedException);
  await rejects(resolver.removeComment(saraComment, anonymous), UnauthorizedException);
  await rejects(resolver.adminComments(undefined, anonymous), UnauthorizedException);

  assert.deepEqual([await total.comments(), await total.replies(), await total.votes()], before, "nothing changed");
});

test("authorization: a regular user cannot reply, edit, delete or read admin comments", async (t) => {
  const { resolver, saraComment, tokens, total } = await authSetup(t);
  const asAli = asRequest(tokens.ali);
  const asSara = asRequest(tokens.sara); // even the comment's own author is a plain USER
  const before = [await total.comments(), await total.replies(), await total.votes()];

  for (const request of [asAli, asSara]) {
    await rejects(resolver.replyToComment(saraComment, "x", request), ForbiddenException, "Admin access required.");
    await rejects(resolver.updateComment(saraComment, "hijacked", request), ForbiddenException, "Admin access required.");
    await rejects(resolver.removeComment(saraComment, request), ForbiddenException, "Admin access required.");
    await rejects(resolver.adminComments(undefined, request), ForbiddenException, "Admin access required.");
    await rejects(resolver.adminComments(CommentStatus.ANSWERED, request), ForbiddenException, "Admin access required.");
  }

  assert.deepEqual([await total.comments(), await total.replies(), await total.votes()], before, "nothing changed");
  const [stored] = (await resolver.productReviews("whey", asAli)).comments;
  assert.equal(stored.content, "original");
  assert.equal(stored.editedByAdmin, false);
  assert.equal(stored.status, CommentStatus.UNANSWERED);
});

test("authorization: the author is always the token's user", async (t) => {
  const { resolver, ali, tokens, db } = await authSetup(t);
  // Ali's token creates Ali's review; there is no way to name another user.
  const created = await resolver.createComment(
    { productSlug: "whey", rating: 4, content: "mine" },
    asRequest(tokens.ali),
  );
  assert.equal(created.userName, "Ali");
  const row = (await db.select().from(comments).where(eq(comments.content, "mine")))[0]!;
  assert.equal(row.userId, ali.id);
});

test("authorization: forged tokens and disabled users are refused", async (t) => {
  const { resolver, addUser, session, saraComment, total } = await authSetup(t);
  const off = await addUser("Off", false);
  const before = await total.comments();

  const legacyAdminToken = Buffer.from(`1:${Date.now()}`).toString("base64");
  await rejects(resolver.adminComments(undefined, asRequest(legacyAdminToken)), UnauthorizedException, "Invalid session.");
  await rejects(resolver.removeComment(saraComment, asRequest(legacyAdminToken)), UnauthorizedException, "Invalid session.");

  await rejects(
    resolver.createComment({ productSlug: "whey", rating: 5, content: "x" }, asRequest(session.signToken(off.id))),
    UnauthorizedException,
    "Your account is disabled.",
  );
  assert.equal(await total.comments(), before);
});

test("authorization: users and admins can vote; admin operations work for an admin", async (t) => {
  const { resolver, saraComment, tokens, total, admin } = await authSetup(t);

  const byUser = await resolver.voteComment(saraComment, VoteType.LIKE, asRequest(tokens.ali));
  assert.equal(byUser.likeCount, 1);
  const byAdmin = await resolver.voteComment(saraComment, VoteType.DISLIKE, asRequest(tokens.admin));
  assert.deepEqual([byAdmin.likeCount, byAdmin.dislikeCount], [1, 1]);

  const asAdmin = asRequest(tokens.admin);
  assert.equal((await resolver.adminComments(undefined, asAdmin)).length, 1);
  const replied = await resolver.replyToComment(saraComment, "thanks", asAdmin);
  assert.equal(replied.status, CommentStatus.ANSWERED);
  assert.equal(replied.reply?.adminName, admin.name);
  const edited = await resolver.updateComment(saraComment, "edited", asAdmin);
  assert.equal(edited.editedByAdmin, true);
  await resolver.removeComment(saraComment, asAdmin);
  assert.equal(await total.comments(), 0);
});

test("productReviews is public; myVote only appears for a signed-in viewer", async (t) => {
  const { resolver, saraComment, tokens } = await authSetup(t);
  await resolver.voteComment(saraComment, VoteType.LIKE, asRequest(tokens.ali));

  const anonymous = (await resolver.productReviews("whey", asRequest())).comments[0];
  const asAli = (await resolver.productReviews("whey", asRequest(tokens.ali))).comments[0];
  const asSara = (await resolver.productReviews("whey", asRequest(tokens.sara))).comments[0];
  const withBadToken = (await resolver.productReviews("whey", asRequest("junk"))).comments[0];

  assert.equal(anonymous.likeCount, 1);
  assert.equal(anonymous.myVote, undefined);
  assert.equal(asAli.myVote, VoteType.LIKE);
  assert.equal(asSara.myVote, undefined);
  assert.equal(withBadToken.myVote, undefined, "a bad token behaves like no token");
});
