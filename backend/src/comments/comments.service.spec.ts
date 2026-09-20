// The database and session services read their configuration from the environment
// when constructed, so set it before creating anything.
process.env.DATABASE_URL = ":memory:";
process.env.JWT_SECRET = "test-secret-with-enough-length-0123456789";

import test from "node:test";
import assert from "node:assert/strict";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { count, eq } from "drizzle-orm";
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

function setup(t: test.TestContext) {
  const database = new DatabaseService();
  database.onModuleInit();
  t.after(() => database.onModuleDestroy());

  const db = database.db;
  const now = new Date().toISOString();
  const addUser = (name: string, isActive = true) =>
    db
      .insert(users)
      .values({
        name,
        email: `${name}@test.dev`,
        providerId: name,
        role: "USER",
        isActive,
        createdAt: now,
      })
      .returning()
      .get();
  const addProduct = (slug: string) =>
    db
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
      .returning()
      .get();

  const commentsService = new CommentsService(database);
  const session = new SessionService(new UserService(database));
  const resolver = new CommentsResolver(commentsService, session);
  const table = (rows: { n: number } | undefined) => rows?.n ?? 0;

  return {
    db,
    admin: db.select().from(users).where(eq(users.role, "ADMIN")).get()!,
    addUser,
    addProduct,
    commentsService,
    session,
    resolver,
    total: {
      comments: () => table(db.select({ n: count() }).from(comments).get()),
      replies: () => table(db.select({ n: count() }).from(replies).get()),
      votes: () => table(db.select({ n: count() }).from(commentVotes).get()),
    },
    product: (id: number) => db.select().from(products).where(eq(products.id, id)).get()!,
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

test("createComment: author comes from the caller, text is trimmed, status starts UNANSWERED", (t) => {
  const { commentsService, addUser, addProduct, db } = setup(t);
  const sara = addUser("Sara");
  addProduct("whey");

  const created = commentsService.create(sara.id, {
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
  assert.equal(db.select().from(comments).get()!.userId, sara.id);
});

test("createComment: invalid input is rejected and nothing is stored", (t) => {
  const { commentsService, addUser, addProduct, total } = setup(t);
  const sara = addUser("Sara");
  addProduct("whey");
  const make = (overrides: object) => () =>
    commentsService.create(sara.id, {
      productSlug: "whey",
      rating: 4,
      content: "ok",
      ...overrides,
    });

  for (const rating of [0, 6, -1, 2.5, Number.NaN]) {
    assert.throws(make({ rating }), BadRequestException, `rating ${rating}`);
  }
  assert.throws(make({ content: "" }), BadRequestException);
  assert.throws(make({ content: "   \n " }), BadRequestException);
  assert.throws(make({ content: "x".repeat(2001) }), BadRequestException);
  assert.throws(make({ productSlug: "missing" }), NotFoundException);
  assert.equal(total.comments(), 0);

  assert.doesNotThrow(make({ content: "x".repeat(2000) }), "2000 characters is allowed");
});

test("createComment: one review per user per product", (t) => {
  const { commentsService, addUser, addProduct, total } = setup(t);
  const [sara, ali] = [addUser("Sara"), addUser("Ali")];
  addProduct("whey");
  addProduct("creatine");
  const input = { productSlug: "whey", rating: 4, content: "ok" };

  commentsService.create(sara.id, input);
  assert.throws(() => commentsService.create(sara.id, input), BadRequestException);
  assert.doesNotThrow(() => commentsService.create(ali.id, input), "another user can review");
  assert.doesNotThrow(
    () => commentsService.create(sara.id, { ...input, productSlug: "creatine" }),
    "same user can review another product",
  );
  assert.equal(total.comments(), 3);
});

test("rating summary and products.rating / review_count stay in sync with comments", (t) => {
  const { commentsService, addUser, addProduct, product, admin } = setup(t);
  const [a, b, c] = [addUser("A"), addUser("B"), addUser("C")];
  const whey = addProduct("whey");
  const at = (id: number, rating: number) =>
    commentsService.create(id, { productSlug: "whey", rating, content: "x" });

  assert.deepEqual(
    { rating: product(whey.id).rating, reviews: product(whey.id).reviewCount },
    { rating: 0, reviews: 0 },
  );

  const five = at(a.id, 5);
  at(b.id, 4);
  at(c.id, 4);
  const summary = commentsService.findByProduct("whey", null);
  assert.equal(summary.count, 3);
  assert.equal(summary.average, 4.3, "13 / 3 rounded to one decimal");
  assert.deepEqual(summary.distribution, [0, 0, 0, 2, 1]);
  assert.equal(product(whey.id).rating, 4.3);
  assert.equal(product(whey.id).reviewCount, 3);

  commentsService.remove(admin.id, Number(five.id));
  assert.equal(product(whey.id).rating, 4);
  assert.equal(product(whey.id).reviewCount, 2);

  for (const row of commentsService.findByProduct("whey", null).comments) {
    commentsService.remove(admin.id, Number(row.id));
  }
  assert.equal(product(whey.id).rating, 0);
  assert.equal(product(whey.id).reviewCount, 0);
  assert.equal(commentsService.findByProduct("whey", null).average, 0);
});

test("voteComment: one rule for like, dislike, remove and switch; one vote per user", (t) => {
  const { commentsService, addUser, addProduct, total, admin } = setup(t);
  const [sara, ali] = [addUser("Sara"), addUser("Ali")];
  addProduct("whey");
  const id = Number(
    commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "x" }).id,
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
    const result = commentsService.vote(ali.id, id, type);
    assert.deepEqual(
      [result.likeCount, result.dislikeCount, result.myVote],
      [likes, dislikes, mine],
      `after ${type}`,
    );
    assert.ok(total.votes() <= 1, "at most one vote row for this user and comment");
  }

  commentsService.vote(ali.id, id, VoteType.LIKE);
  const both = commentsService.vote(sara.id, id, VoteType.DISLIKE);
  assert.deepEqual([both.likeCount, both.dislikeCount, both.myVote], [1, 1, VoteType.DISLIKE]);
  const byAdmin = commentsService.vote(admin.id, id, VoteType.LIKE);
  assert.deepEqual([byAdmin.likeCount, byAdmin.dislikeCount], [2, 1], "admins vote like anyone else");
  assert.equal(total.votes(), 3);

  assert.throws(() => commentsService.vote(ali.id, 9999, VoteType.LIKE), NotFoundException);
});

test("findByProduct: counts, replies and myVote are per comment and per viewer, newest first", (t) => {
  const { commentsService, addUser, addProduct, admin } = setup(t);
  const [a, b, c] = [addUser("A"), addUser("B"), addUser("C")];
  addProduct("whey");
  const add = (user: { id: number }, rating: number) =>
    Number(commentsService.create(user.id, { productSlug: "whey", rating, content: `by ${user.id}` }).id);
  const [first, second, third] = [add(a, 5), add(b, 3), add(c, 1)];

  commentsService.vote(b.id, first, VoteType.LIKE);
  commentsService.vote(c.id, first, VoteType.LIKE);
  commentsService.vote(a.id, second, VoteType.DISLIKE);
  commentsService.reply(admin.id, second, "answer");

  const view = (viewer: number | null) =>
    Object.fromEntries(
      commentsService
        .findByProduct("whey", viewer)
        .comments.map((row) => [row.id, row]),
    );
  const asB = view(b.id);
  assert.deepEqual([asB[first].likeCount, asB[first].dislikeCount, asB[first].myVote], [2, 0, VoteType.LIKE]);
  assert.deepEqual([asB[second].likeCount, asB[second].dislikeCount, asB[second].myVote], [0, 1, undefined]);
  assert.deepEqual([asB[third].likeCount, asB[third].dislikeCount, asB[third].myVote], [0, 0, undefined]);
  assert.equal(asB[second].reply?.content, "answer");
  assert.equal(asB[second].reply?.adminName, admin.name);
  assert.equal(asB[first].reply, undefined);

  const anonymous = view(null);
  assert.equal(anonymous[first].likeCount, 2, "anonymous still sees counts");
  assert.equal(anonymous[first].myVote, undefined, "but no personal vote");

  const order = commentsService.findByProduct("whey", null).comments.map((row) => Number(row.id));
  assert.deepEqual(order, [third, second, first], "newest first");
});

test("replyToComment: sets ANSWERED in the same step, one reply only, status filter follows", (t) => {
  const { commentsService, addUser, addProduct, admin, total } = setup(t);
  const [sara, ali] = [addUser("Sara"), addUser("Ali")];
  addProduct("whey");
  const first = Number(commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "x" }).id);
  const second = Number(commentsService.create(ali.id, { productSlug: "whey", rating: 3, content: "y" }).id);

  const statuses = (status?: CommentStatus) =>
    commentsService.findAllForAdmin(admin.id, status).map((row) => Number(row.id)).sort();
  assert.deepEqual([statuses().length, statuses(CommentStatus.UNANSWERED).length, statuses(CommentStatus.ANSWERED).length], [2, 2, 0]);

  const answered = commentsService.reply(admin.id, first, "  thanks  ");
  assert.equal(answered.status, CommentStatus.ANSWERED);
  assert.equal(answered.reply?.content, "thanks");
  assert.equal(answered.reply?.adminName, admin.name);
  assert.deepEqual(statuses(CommentStatus.ANSWERED), [first]);
  assert.deepEqual(statuses(CommentStatus.UNANSWERED), [second]);

  assert.throws(() => commentsService.reply(admin.id, first, "again"), BadRequestException);
  assert.throws(() => commentsService.reply(admin.id, second, "   "), BadRequestException);
  assert.throws(() => commentsService.reply(admin.id, second, "x".repeat(2001)), BadRequestException);
  assert.throws(() => commentsService.reply(admin.id, 9999, "x"), NotFoundException);
  assert.equal(total.replies(), 1, "failed replies stored nothing");
  assert.equal(
    commentsService.findAllForAdmin(admin.id, CommentStatus.UNANSWERED)[0].status,
    CommentStatus.UNANSWERED,
    "a failed reply did not flip the status",
  );
});

test("updateComment: changes the text only and flags it as edited by an admin", (t) => {
  const { commentsService, addUser, addProduct, admin } = setup(t);
  const sara = addUser("Sara");
  addProduct("whey");
  const created = commentsService.create(sara.id, { productSlug: "whey", rating: 4, content: "original" });
  commentsService.reply(admin.id, Number(created.id), "answer");

  const edited = commentsService.update(admin.id, Number(created.id), "  fixed  ");
  assert.equal(edited.content, "fixed");
  assert.equal(edited.editedByAdmin, true);
  assert.equal(edited.rating, 4);
  assert.equal(edited.userName, "Sara");
  assert.equal(edited.status, CommentStatus.ANSWERED);
  assert.equal(edited.reply?.content, "answer");
  assert.ok(edited.updatedAt >= created.updatedAt, "updatedAt moves forward");
  assert.equal(edited.createdAt, created.createdAt, "createdAt is untouched");

  assert.throws(() => commentsService.update(admin.id, Number(created.id), " "), BadRequestException);
  assert.throws(() => commentsService.update(admin.id, 9999, "x"), NotFoundException);
});

test("removeComment: replies and votes go with it; deleting a product removes its comments", (t) => {
  const { commentsService, addUser, addProduct, admin, total, db } = setup(t);
  const [sara, ali] = [addUser("Sara"), addUser("Ali")];
  const whey = addProduct("whey");
  addProduct("creatine");
  const doomed = Number(commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "x" }).id);
  const kept = Number(commentsService.create(ali.id, { productSlug: "whey", rating: 3, content: "y" }).id);
  commentsService.vote(ali.id, doomed, VoteType.LIKE);
  commentsService.vote(sara.id, kept, VoteType.LIKE);
  commentsService.reply(admin.id, doomed, "answer");
  commentsService.create(ali.id, { productSlug: "creatine", rating: 2, content: "z" });

  const removed = commentsService.remove(admin.id, doomed);
  assert.equal(Number(removed.id), doomed);
  assert.equal(removed.reply?.content, "answer", "the removed comment is returned in full");
  assert.deepEqual([total.comments(), total.replies(), total.votes()], [2, 0, 1]);
  assert.throws(() => commentsService.remove(admin.id, doomed), NotFoundException);

  db.delete(products).where(eq(products.id, whey.id)).run();
  assert.equal(total.comments(), 1, "only the other product's comment remains");
  assert.equal(total.votes(), 0);
  assert.equal(commentsService.findByProduct("creatine", null).count, 1);
  assert.throws(() => commentsService.findByProduct("whey", null), NotFoundException);
});

// ---------------------------------------------------------------------------
// Authorization (raw.md section 11). These go through the resolver, which is where
// the session checks live, using real tokens against a real database.
// ---------------------------------------------------------------------------

function authSetup(t: test.TestContext) {
  const ctx = setup(t);
  const sara = ctx.addUser("Sara");
  const ali = ctx.addUser("Ali");
  ctx.addProduct("whey");
  const tokens = {
    admin: ctx.session.signToken(ctx.admin.id),
    sara: ctx.session.signToken(sara.id),
    ali: ctx.session.signToken(ali.id),
  };
  const saraComment = Number(
    ctx.commentsService.create(sara.id, { productSlug: "whey", rating: 5, content: "original" }).id,
  );
  return { ...ctx, sara, ali, tokens, saraComment };
}

test("authorization: anonymous callers cannot create, vote or use any admin operation", async (t) => {
  const { resolver, saraComment, total } = authSetup(t);
  const anonymous = asRequest();
  const before = [total.comments(), total.replies(), total.votes()];

  await rejects(resolver.createComment({ productSlug: "whey", rating: 5, content: "x" }, anonymous), UnauthorizedException, "Please sign in first.");
  await rejects(resolver.voteComment(saraComment, VoteType.LIKE, anonymous), UnauthorizedException);
  await rejects(resolver.replyToComment(saraComment, "x", anonymous), UnauthorizedException);
  await rejects(resolver.updateComment(saraComment, "x", anonymous), UnauthorizedException);
  await rejects(resolver.removeComment(saraComment, anonymous), UnauthorizedException);
  await rejects(resolver.adminComments(undefined, anonymous), UnauthorizedException);

  assert.deepEqual([total.comments(), total.replies(), total.votes()], before, "nothing changed");
});

test("authorization: a regular user cannot reply, edit, delete or read admin comments", async (t) => {
  const { resolver, saraComment, tokens, total } = authSetup(t);
  const asAli = asRequest(tokens.ali);
  const asSara = asRequest(tokens.sara); // even the comment's own author is a plain USER
  const before = [total.comments(), total.replies(), total.votes()];

  for (const request of [asAli, asSara]) {
    await rejects(resolver.replyToComment(saraComment, "x", request), ForbiddenException, "Admin access required.");
    await rejects(resolver.updateComment(saraComment, "hijacked", request), ForbiddenException, "Admin access required.");
    await rejects(resolver.removeComment(saraComment, request), ForbiddenException, "Admin access required.");
    await rejects(resolver.adminComments(undefined, request), ForbiddenException, "Admin access required.");
    await rejects(resolver.adminComments(CommentStatus.ANSWERED, request), ForbiddenException, "Admin access required.");
  }

  assert.deepEqual([total.comments(), total.replies(), total.votes()], before, "nothing changed");
  const [stored] = (await resolver.productReviews("whey", asAli)).comments;
  assert.equal(stored.content, "original");
  assert.equal(stored.editedByAdmin, false);
  assert.equal(stored.status, CommentStatus.UNANSWERED);
});

test("authorization: the author is always the token's user", async (t) => {
  const { resolver, ali, tokens, db } = authSetup(t);
  // Ali's token creates Ali's review; there is no way to name another user.
  const created = await resolver.createComment(
    { productSlug: "whey", rating: 4, content: "mine" },
    asRequest(tokens.ali),
  );
  assert.equal(created.userName, "Ali");
  const row = db.select().from(comments).where(eq(comments.content, "mine")).get()!;
  assert.equal(row.userId, ali.id);
});

test("authorization: forged tokens and disabled users are refused", async (t) => {
  const { resolver, addUser, session, saraComment, total } = authSetup(t);
  const off = addUser("Off", false);
  const before = total.comments();

  const legacyAdminToken = Buffer.from(`1:${Date.now()}`).toString("base64");
  await rejects(resolver.adminComments(undefined, asRequest(legacyAdminToken)), UnauthorizedException, "Invalid session.");
  await rejects(resolver.removeComment(saraComment, asRequest(legacyAdminToken)), UnauthorizedException, "Invalid session.");

  await rejects(
    resolver.createComment({ productSlug: "whey", rating: 5, content: "x" }, asRequest(session.signToken(off.id))),
    UnauthorizedException,
    "Your account is disabled.",
  );
  assert.equal(total.comments(), before);
});

test("authorization: users and admins can vote; admin operations work for an admin", async (t) => {
  const { resolver, saraComment, tokens, total, admin } = authSetup(t);

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
  assert.equal(total.comments(), 0);
});

test("productReviews is public; myVote only appears for a signed-in viewer", async (t) => {
  const { resolver, saraComment, tokens } = authSetup(t);
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
