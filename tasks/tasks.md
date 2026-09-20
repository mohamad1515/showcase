# Tasks — Product Reviews & Ratings

Implementation plan for [raw.md](raw.md). Tick each box as it is finished so no step is done twice. Order matters: every task only depends on tasks above it.

## How this plan avoids repeated work

- **The architecture audit (raw.md §13) is already done** — see *Findings* below. Don't re-audit; just open the files a task names.
- **One comments module** owns Comment, Reply and Vote (one aggregate, one `Comment` GraphQL type used by both the product page and the admin page). No separate reply/vote modules.
- **One shared session service** replaces the token/user-lookup code that currently lives inline in `ShopResolver`. Cart, comments and admin checks all call it. Authorization is written once and tested once.
- **One `voteComment` mutation** covers Like, Dislike, Remove vote and Like↔Dislike switch (raw.md §8 lists them separately; they are the same state machine).
- **One `productReviews` query** returns list + average + count + distribution + the viewer's own votes. The UI never stitches several calls together.
- **One `StarRating` component** is used for the summary, each comment, the form input and the admin list.
- **Aggregates (likes, dislikes, reply, my vote) are loaded with one grouped query per set of comments**, shared by the public and admin queries — no N+1.
- **Docs are updated once, at the end** (T12), not per phase.

## Findings from the audit (what the plan is built on)

| Area | What exists | Consequence for this feature |
| --- | --- | --- |
| Auth | `login` returns `base64("<userId>:<timestamp>")`. `ShopResolver.currentUserId` decodes it. Nothing verifies a signature. | Anyone can forge a token for any user id, so raw.md §11 ("userId can't be forged") is **not achievable without signing tokens** → T2. |
| Roles | `users.role` is `USER`/`ADMIN` in the DB; the token doesn't carry it. Only the frontend `AdminGuard` checks it. | Backend must load the user and check `role` + `is_active` per request → T2. |
| Migrations | No tool. `DatabaseService.createTables()` runs `CREATE TABLE IF NOT EXISTS` + `ensureColumn`; `db/schema.ts` mirrors it for Drizzle. | "Migration" = idempotent DDL in `createTables()` **and** Drizzle tables in `schema.ts` → T1. |
| Foreign keys | Not used by existing tables, but `better-sqlite3` has `PRAGMA foreign_keys = 1` by default (verified). | New tables can use `ON DELETE CASCADE` for replies/votes/comments. |
| Product rating | `products.rating` (int) and `review_count` are manual inputs in `ProductForm`; the admin products page counts `rating >= 4` / `reviewCount >= 10`. The detail page shows a **hardcoded 4.5 stars**. | Two competing sources of rating truth unless reconciled → decision D2, T5, T8. |
| Ids in GraphQL | Numeric ids are `number` args → `Float!`; frontend converts with `Number(id)`. | Follow the convention for `commentId`. |
| Validation | No `class-validator`. | Validate manually in the service (no new dependency). |
| Admin UI | `AdminGuard`, `AdminPageHeader`, `StatusBadge.tsx` (`ActiveBadge`, `Pill`), dashboard `sections` array in `admin/page.tsx`. Delete confirmation is `window.confirm`. Toasts: `lib/toast.ts`. | Reuse all of these → T9. |
| Product page | Async server component; reads no token. | Reviews must be a client component (needs the viewer's token for `myVote`) → T8. |
| Tests | `node:test` via `tsx`, e.g. `shop/pricing.spec.ts`. | Same runner → T10. |
| UI language | Persian, RTL. | Copy is fixed once in *UI copy* below. |

## Decisions (defaults chosen — change before starting if you disagree)

- **D1 — Sign login tokens (default: yes).** HMAC-SHA256 with `node:crypto` (no new dependency), secret from `JWT_SECRET`, expiry from `JWT_EXPIRY` (both already named in `backend/.env.example`). Cost: tokens issued before this change stop working, so users sign in again.
- **D2 — Comments become the single source of product rating (default: yes).** `products.rating` (rounded average) and `review_count` are recalculated from comments; the two manual inputs are removed from `ProductForm` and become optional/defaulted on the backend. Storefront sorting and admin counts then reflect real data. Alternative: leave them manual and only compute a separate average for the detail page — this keeps two "ratings" and is not recommended.
- **D3 — One review per user per product (default: yes),** enforced by `UNIQUE(user_id, product_id)`. raw.md doesn't say; without it one user can stack ratings. Drop the constraint and the duplicate check if you want unlimited reviews.
- **D4 — Delete confirmation uses `window.confirm`,** matching every existing admin delete. A custom modal would be a new component for no functional gain.
- **D5 — One reply per comment, no edit/delete of replies.** Not in raw.md; `UNIQUE(comment_id)` on replies. A second reply attempt returns a clear error.

## UI copy (decided once)

| English (raw.md) | Persian |
| --- | --- |
| User Reviews | نظرات کاربران |
| Comment Management | مدیریت نظرات |
| All Messages / Unanswered / Answered | همه پیام‌ها / بدون پاسخ / پاسخ داده‌شده |
| Admin Reply | پاسخ مدیر |
| Edited by admin | ویرایش‌شده توسط مدیر |
| Empty state | هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که نظر خود را به اشتراک می‌گذارد. |
| Logged-out message | برای ثبت نظر ابتدا وارد حساب کاربری شوید یا ثبت‌نام کنید. |

---

## Phase 1 — Database

- [x] **T1. Tables and Drizzle schema** — `backend/src/db/database.service.ts`, `backend/src/db/schema.ts`
  - Add to `createTables()` (`CREATE TABLE IF NOT EXISTS`, idempotent, no data loss):
    - `comments`: `id`, `user_id`, `product_id`, `content`, `rating` (`CHECK 1..5`), `status` (`CHECK IN ('UNANSWERED','ANSWERED')`, default `'UNANSWERED'`), `edited_by_admin` (0/1), `created_at`, `updated_at`; `UNIQUE(user_id, product_id)` (D3); FKs to `users`/`products` with `ON DELETE CASCADE`; indexes on `(product_id, created_at)` and `(status)`.
    - `replies`: `id`, `comment_id` (`UNIQUE`, FK cascade), `admin_id` (FK `users`), `content`, `created_at`, `updated_at`.
    - `comment_votes`: `id`, `comment_id` (FK cascade), `user_id` (FK `users`), `type` (`CHECK IN ('LIKE','DISLIKE')`), `created_at`, `updated_at`; `UNIQUE(comment_id, user_id)`.
  - Mirror the three tables in `schema.ts` and export `CommentRow`, `ReplyRow`, `CommentVoteRow` types like the existing ones. Constraints live in the DDL (existing convention).
  - Done when: server boots on the existing `showcase.sqlite` and on a fresh one; second boot is a no-op.

## Phase 2 — Authentication / authorization (write once, reuse everywhere)

- [ ] **T2. Shared session service** — new `backend/src/auth/session.service.ts`; edit `auth.resolver.ts`, `auth.module.ts`, `shop/shop.resolver.ts`, `shop/shop.module.ts`, `backend/.env.example`
  - `signToken(userId)` / verify with HMAC + expiry (D1). Production refuses to start without `JWT_SECRET`; development falls back to a dev-only secret and logs a warning.
  - `requireUser(req)` → verified, existing, active user (401 on missing/invalid/expired/disabled).
  - `requireAdmin(req)` → `requireUser` + `role === "ADMIN"` read from the DB, not the token (403 otherwise).
  - `optionalUser(req)` → user or `null`, never throws (for public queries that add `myVote`).
  - Replace `AuthResolver.generateToken` and delete `ShopResolver.currentUserId`; both call the service. Export the service from `AuthModule`; `ShopModule` imports `AuthModule`.
  - Done when: existing login, cart and orders still work with new tokens; a hand-made base64 token is rejected.

## Phase 3 — Backend comments module

- [ ] **T3. `comments` module** — new `backend/src/comments/`: `comment.model.ts`, `comment.input.ts`, `comments.service.ts`, `comments.resolver.ts`, `comments.module.ts` (same layout as `brands/`, `flavors/`)
  - **Models** (`registerEnumType` for `CommentStatus`, `VoteType`):
    - `Reply { id, content, adminName, createdAt, updatedAt }`
    - `Comment { id, userName, rating, content, status, editedByAdmin, createdAt, updatedAt, likeCount, dislikeCount, myVote?, reply?, productSlug, productName }` — exposes the author's **name only** (never email/password; do not reuse the `User` type).
    - `ProductReviews { average, count, distribution: [Int] (index 0 = 1★ … 4 = 5★), comments: [Comment] }`
  - **Inputs:** `CreateCommentInput { productSlug, rating, content }`. Other operations take plain args.
  - **API** (all under existing `/graphql`):

    | Operation | Type | Guard |
    | --- | --- | --- |
    | `productReviews(productSlug)` | Query | public, `optionalUser` for `myVote` |
    | `adminComments(status?)` | Query | `requireAdmin` (no status = "All") |
    | `createComment(input)` | Mutation | `requireUser`; author id from the session, never from input |
    | `voteComment(commentId, type)` | Mutation | `requireUser` (users and admins) |
    | `replyToComment(commentId, content)` | Mutation | `requireAdmin` |
    | `updateComment(commentId, content)` | Mutation | `requireAdmin` |
    | `removeComment(commentId)` | Mutation | `requireAdmin` |

  - **Service rules:**
    - Validate: `rating` integer 1–5; `content` trimmed, non-empty, ≤ 2000 chars (reply/edit too); product/comment must exist (`NotFoundException`); duplicate review → clear `BadRequestException` (D3).
    - `voteComment` runs in one transaction using a single transition rule: same type again → delete vote; other type → update vote; none → insert. Returns the refreshed `Comment`.
    - `replyToComment` inserts the reply **and** sets `status = 'ANSWERED'` in one transaction; second reply → error (D5). Users cannot reply anywhere because no user-facing reply operation exists.
    - `updateComment` changes `content` only, sets `edited_by_admin = 1` and `updated_at`; status unchanged.
    - `removeComment` deletes the comment; replies and votes go via `ON DELETE CASCADE`.
    - One private `hydrate(rows, viewerId)` builds `likeCount`/`dislikeCount`/`myVote`/`reply` with grouped queries and is used by both queries and every mutation's return value.
    - After create/remove, recalculate `products.rating`/`review_count` in the same transaction (D2), directly via `DatabaseService` so `CommentsModule` doesn't depend on `ProductsModule`.
  - Done when: each operation works from the Apollo landing page at `/graphql` with real tokens.

- [ ] **T4. Register module** — `backend/src/app.module.ts`: add `CommentsModule` to `imports`.

- [ ] **T5. Apply D2 to products** *(skip if D2 is rejected)* — `products/product.input.ts`, `product.model.ts` (keep fields), `products.service.ts` (create sets `rating: 0`, `reviewCount: 0`; update no longer overwrites them), `frontend/app/lib/products.ts` (`ProductInput`), `frontend/app/components/admin/ProductForm.tsx` (remove the rating and reviewCount inputs, ~lines 380–390). Admin products page counters stay as they are.

## Phase 4 — Frontend shared layer

- [ ] **T6. Types and API functions** — `frontend/app/lib/products.ts`, `frontend/app/lib/graphql.ts`
  - Types: `CommentStatus`, `VoteType`, `Reply`, `Comment`, `ProductReviews`.
  - One `commentFields` fragment (like the existing `productFields`) reused by every function: `getProductReviews`, `getAdminComments(status?)`, `createComment`, `voteComment`, `replyToComment`, `updateComment`, `removeComment`. Ids go through `Number(id)` as elsewhere.

- [ ] **T7. `StarRating` component** — new `frontend/app/components/reviews/StarRating.tsx`
  - Display mode (supports fractional averages) and input mode (1–5, keyboard accessible, `aria-label`s). Uses `FiStar`, already used on the product page. Used by T8 and T9 only — nothing else builds stars.

## Phase 5 — Product detail page

- [ ] **T8. Reviews section** — new `components/reviews/ProductReviews.tsx`, `ReviewForm.tsx`, `ReviewItem.tsx`; edit `frontend/app/products/[slug]/page.tsx`
  - `ProductReviews` (client): fetches `productReviews` with the stored token; shows average, count, 1–5★ distribution bars, the form or the logged-out message (`useAuth`), the list, skeleton while loading, and the empty state.
  - `ReviewForm`: star input + textarea, submit loading state; on success clears the form, adds the returned comment to state, shows a success toast, calls `router.refresh()` so the server-rendered header rating updates. Errors go through `errorMessage` + `notifyError`.
  - `ReviewItem`: name, stars, date, text, "edited by admin" note, like/dislike buttons with counts (`aria-pressed`, highlighted for the viewer's vote, disabled while pending; logged-out click → info toast), and the admin reply under the comment with a «پاسخ مدیر» `Pill` badge. No reply control here — replying happens only in the admin page (T9), so there is one reply UI.
  - Page edit: delete the hardcoded 4.5-star block and show the real average/count (server-fetched, links to `#reviews`); render `<ProductReviews productSlug=… />`.
  - Responsive: single column on mobile, summary and distribution side by side from `sm`. Use existing tokens (`bg-surface`, `text-muted`, `text-accent`, …), RTL-safe classes.

## Phase 6 — Admin dashboard

- [ ] **T9. Comment Management page** — new `frontend/app/admin/comments/page.tsx`; edit `frontend/app/admin/page.tsx` (add a card to `sections`) and `components/admin/StatusBadge.tsx` (add a `CommentStatusBadge` next to `ActiveBadge`/`Pill`)
  - Wrapped in `AdminGuard`, headed by `AdminPageHeader`, tabs «همه پیام‌ها | بدون پاسخ | پاسخ داده‌شده» (`role="tablist"`) that call `adminComments` with `undefined` / `UNANSWERED` / `ANSWERED` — server-side filtering by the stored status.
  - Each row shows every raw.md §5 "View" field (user, text, product, rating, date, likes, dislikes, reply status), so **View is the row itself — no separate detail route.**
  - Actions: **Reply** (inline textarea, hidden once answered), **Edit** (inline textarea), **Delete** (`window.confirm`, D4). Updates local state from the mutation's returned `Comment`; when a reply flips a comment to `ANSWERED` it leaves the "Unanswered" tab immediately. Loading/empty states per tab; toasts for outcomes.

## Phase 7 — Verification

- [ ] **T10. Automated tests** (backend, `node:test` via `tsx`, `DATABASE_URL=":memory:"`) — `comments/comments.service.spec.ts`, `auth/session.service.spec.ts`
  - Session: forged, expired and tampered tokens rejected; disabled user rejected; `USER` denied by `requireAdmin`.
  - Comments (this is the **single place** that verifies raw.md §11):
    - author id always comes from the session; unauthenticated create fails
    - non-admin reply / edit / delete fail
    - vote transitions: none→LIKE, LIKE→LIKE (removed), LIKE→DISLIKE, and only one vote row per user per comment
    - reply sets `ANSWERED`, second reply rejected
    - deleting a comment removes its replies and votes; deleting a product removes its comments
    - rating summary and `products.rating`/`review_count` correct after create and delete
    - status filter returns the right rows

- [ ] **T11. Build, lint, manual run**
  - Backend: `npm run build`, `npm test`. (`npm run lint` has no ESLint config today — not part of this feature.)
  - Frontend: `npm run lint`, `npm run build`.
  - Manual pass with the servers running (backend needs the `better-sqlite3` native binary — see `backend/CLAUDE.md`): register two users + the seeded admin; post a review (form clears, list and header update without a full reload); like → like again → dislike; confirm counts and icon state; admin replies (comment moves Unanswered → Answered, reply badge visible on the product page); admin edits (note appears); admin deletes (confirm shown, comment gone); check the product page at mobile width; stop the servers afterwards.
  - Fix everything that fails, then re-run only the failing step.

## Phase 8 — Wrap-up

- [ ] **T12. Update docs once** — `backend/CLAUDE.md` (comments module, new operations, signed tokens/`JWT_SECRET`, remove the "token is forgeable" gotcha if D1 done, rating sync), `backend/README.md` (API table, env table, security notice), `frontend/CLAUDE.md` and `frontend/README.md` (`/admin/comments`, `components/reviews/`), `backend/.env.example` (already touched in T2).
- [ ] **T13. Final report** (raw.md §14): list every changed/new file, the tests run and their results, and anything intentionally left out. Commit only if asked.

---

## Requirement → task map (raw.md section → where it is covered)

| raw.md | Covered by |
| --- | --- |
| §1 Submit review, stars, login message | T3 (`createComment`), T7, T8 |
| §2 One-way admin reply | T3 (no user reply op, `UNIQUE(comment_id)`), T8 (display only), T9 (reply UI) |
| §3 Like/Dislike logic | T1 (`UNIQUE(comment_id,user_id)`), T3 (`voteComment`), T8 |
| §4, §10 Admin page + tabs | T9 (uses T3 `adminComments`) |
| §5 View / Reply / Edit / Delete | T3 + T9 |
| §6 Status stored in DB | T1 (`CHECK` column), T3 (set with the reply, same transaction) |
| §7 Database design | T1 |
| §8 Backend / API | T3, T4 |
| §9 Product UI | T7, T8 |
| §11 Authorization & security | T2 (enforcement), T3 (per-operation guards), T10 (proof) |
| §12 UX (loading, toasts, no refresh, empty state) | T8, T9 |
| §13 Review before coding | Findings (done) |
| §14 Output, migrations, tests, build | T1 (migrations), T10–T13 |

## Out of scope (noted, not planned)

Existing admin mutations for products, users, categories, brands, flavors and sliders are still unauthenticated on the backend, and passwords are still stored in plaintext. `SessionService` (T2) makes fixing the mutations a one-line `requireAdmin` call each, but doing so is a separate change.
