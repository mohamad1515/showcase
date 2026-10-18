# CLAUDE.md — backend

NestJS 11 + GraphQL (code-first, Apollo Server 5, Express 5) API for a Persian-language supplements shop. Persistence is PostgreSQL via `pg` (`Pool`), with Drizzle ORM (`drizzle-orm/node-postgres`) used for queries. Consumed by `../frontend`.

## Commands

Run from `backend/`. Both `package-lock.json` and `pnpm-lock.yaml` exist; the Dockerfile uses `npm ci`, so prefer npm.

```bash
npm install
npm run start:dev   # nest start --watch
npm run build       # nest build -> dist/
npm start           # nest start (NOT `node dist/main` — it compiles on start)
npm run lint        # eslint "src/**/*.ts"  (no eslint config file exists in backend/ — see Gotchas)
npm test            # tsx --test src/**/*.spec.ts  (node:test runner, not Jest)
npm run db:seed     # tsx src/db/seed.ts
```

Specs live next to the code (`*.spec.ts`, excluded from `nest build`): `shop/pricing.spec.ts`, `auth/session.service.spec.ts`, `comments/comments.service.spec.ts` (28 tests, a few seconds). Use `node:test` + `node:assert/strict` for new specs, not Jest.

Testing notes:
- Service specs build their objects by hand (`new CommentsService(database)`, `new SessionService(new UserService(database))`) — see `comments.service.spec.ts` for a `setup()` helper. `session.service.spec.ts` mocks `UserService` entirely and needs no database.
- `comments.service.spec.ts` needs a real Postgres (there is no `:memory:` equivalent once SQLite is gone). It runs against a dedicated database, `showcase_test` by default, on the same server as `docker-compose.yml`'s `postgres` service (`docker compose up -d postgres` from the `showcase/` root first). The spec creates `showcase_test` itself on first run (connecting to the compose service's default `your_database` to issue `CREATE DATABASE` if missing) and truncates the mutable tables before each test, then re-runs `onModuleInit()` to restore the seeded admin user — this stands in for the old "fresh in-memory DB per test" isolation. Override `TEST_DATABASE_URL` / `TEST_MAINTENANCE_DATABASE_URL` env vars to point elsewhere. If Postgres isn't reachable, this spec fails outright (no fallback).
- `tsx` (esbuild) does not emit decorator metadata, so specs cannot boot the Nest app or build the GraphQL schema (it crashes in `LazyMetadataStorage.load`). Calling resolver methods directly is fine. For an end-to-end check, compile with `tsc --outDir <tmp>` and run the compiled JS.
- Test authorization through the resolver with real tokens (`session.signToken(userId)`), not by calling the service, because the checks live in the resolver.

## Configuration

Read directly from `process.env` (no ConfigModule, no dotenv import — `.env` is only loaded if the runner does it). Copy `.env.example` to `.env`.

| Var | Default | Used by |
| --- | --- | --- |
| `PORT` | `4000` | `main.ts`, upload URL fallback |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin (`credentials: true`) |
| `BACKEND_PUBLIC_URL` | `http://localhost:$PORT` | startup logs, upload response URL |
| `DATABASE_URL` | `postgresql://your_username:your_password@localhost:5432/your_database` | **A standard Postgres connection string**, passed straight to `pg.Pool({ connectionString })` |
| `JWT_SECRET` | dev-only fallback | HMAC key for login tokens. **Required when `NODE_ENV=production`** (startup throws without it) |
| `JWT_EXPIRY` | `24h` | Token lifetime: a number + `s`/`m`/`h`/`d`; anything else throws at startup |

The backend does **not** load `.env` itself, so `JWT_SECRET` (like every variable above) must be in the real process environment. Without it, non-production runs use a built-in insecure secret and log a warning. The Dockerfile does not set `NODE_ENV`, so pass `-e NODE_ENV=production -e JWT_SECRET=...` when running the container to get the guard.

`DATABASE_URL` is a real external Postgres (Neon, Supabase, Vercel Postgres, or anything else that speaks the Postgres wire protocol) in production — this matters because the backend targets Vercel serverless functions, whose filesystem is ephemeral/read-only, so the old local-SQLite-file approach could never persist data there. For local dev, run `docker compose up -d postgres` from the `showcase/` root (the `postgres` service in `../docker-compose.yml`) and point `DATABASE_URL` at `postgresql://your_username:your_password@localhost:5432/your_database` (`backend/.env.example` has the exact value matching that compose file). The compose file's `graphql` service runs the backend itself inside Docker and points at the same credentials via the `postgres` hostname instead of `localhost`.

The default port is 4000. Frontend config and `next.config.ts` image patterns assume `localhost:4000`.

## Architecture

```
src/
  main.ts            bootstrap: CORS, static assets from ./public, listen
  app.module.ts      GraphQLModule.forRoot (autoSchemaFile: true, context => { req }) + feature modules
  db/                DatabaseModule/DatabaseService (connection, DDL, seed), schema.ts (Drizzle), seed*.ts
  auth/              signup/login mutations, session.service.ts (token signing + access checks), oauth2 strategy (placeholder)
  user/              User entity, inputs, service, resolver (registered in AuthModule, not its own module)
  products|categories|sliders|flavors|brands/   *.model.ts, *.input.ts, *.service.ts, *.resolver.ts, *.module.ts
  comments/          reviews: comments, admin replies, votes (one module, one `Comment` GraphQL type)
  shop/              cart + orders (resolver, service, pricing.ts helpers, spec)
  upload/            POST /upload (multer disk storage -> ./public/uploads)
  graphiql.controller.ts   see Gotchas
```

Per-feature convention: `*.model.ts` (`@ObjectType`), `*.input.ts` (`@InputType`), `*.service.ts` (Drizzle queries), `*.resolver.ts` (thin), `*.module.ts`. Follow it for new domains and add the module to `AppModule.imports`.

The GraphQL schema is generated from decorators at startup (`autoSchemaFile: true` = in memory, no `schema.gql` on disk). Any change to a `@Field` shows up in the schema on restart, and `../frontend/app/lib/graphql.ts` holds hand-written query strings that must be updated to match.

### Authentication and permissions

`SessionService` (`auth/session.service.ts`, exported by `AuthModule`; import `AuthModule` in any module that needs it) is the only place that reads the `Authorization` header. Resolvers call:

- `requireUser(req)` — signed-in, existing, active user (401 otherwise: "Please sign in first." / "Invalid session." / "Your account is disabled.")
- `requireAdmin(req)` — as above plus `role === "ADMIN"` (403 "Admin access required.")
- `optionalUser(req)` — the user or `null`, never throws (public queries that add per-viewer data, e.g. `myVote`)

Take `@Context("req") req: Request` in the resolver, call the guard first, and pass `user.id` to the service. Never accept a user id from the client.

Tokens are `base64url(payload).base64url(HMAC-SHA256)` with `{ sub, exp }`. They are verified with a constant-time compare, and the user's **role and active flag are read from the database on every request**, so demotions and disabled accounts take effect immediately. Tokens from before this scheme (plain base64) are rejected, and users must sign in again after a `JWT_SECRET` change.

### Database

- `DatabaseService` (`db/database.service.ts`) owns a `pg.Pool` (via `DATABASE_URL`) and a `drizzle-orm/node-postgres` handle, and runs on `onModuleInit` (now `async`): runs `CREATE TABLE IF NOT EXISTS` for every table, then `ensureColumn` migrations, then `migrateProductSlugs()`, then `seed()`. No WAL/pragma step — that was SQLite-specific and has no Postgres equivalent.
- **There is no migration tool.** The raw DDL in `createTables()` and the Drizzle definitions in `db/schema.ts` are two separate sources of truth and must be edited together. To add a column: update `schema.ts`, add an `ensureColumn(...)` call (now checks `information_schema.columns` instead of `PRAGMA table_info`), and if the table is new add its `CREATE TABLE`. Raw SQL placeholders are Postgres-style (`$1, $2, ...`), not SQLite's `?`.
- `createTables()` **drops the `products` table** if it lacks a `persian_name` column (legacy-schema reset). Do not rename that column without revisiting this.
- Seed on every boot (`INSERT ... ON CONFLICT (...) DO NOTHING`, the Postgres equivalent of SQLite's `INSERT OR IGNORE`): one admin user, two categories (`sports-supplements`, `food-supplements`), one slider. Products are not seeded (`db/seed.ts` only creates empty tables; `db/seed-data.ts` is not used by boot).
- Money is stored as **formatted strings** (e.g. `"1,250,000"`), and list-like fields (`features`, `tags`, `brands`, `flavors`, `galleryImages`) are native `jsonb` columns (Drizzle returns them already parsed as arrays — no more JSON-in-text parsing). `users.isActive` and `comments.editedByAdmin` are native `boolean` columns (no more integer-as-boolean). Arithmetic goes through `shop/pricing.ts`, which strips non-digits — decimals are not supported.
- `products.rating` is a `DOUBLE PRECISION` column, not `INTEGER` — it holds a decimal average (e.g. `4.3`); SQLite's dynamic typing silently tolerated a float in an `INTEGER` column, but Postgres enforces the declared type, so this was widened during the Postgres migration.
- Product `slug` is derived from `englishName` (`generateSlug`) and re-derived on rename; `migrateProductSlugs()` re-normalizes all slugs on every boot.
- `products.brand`/`flavor` (single) coexist with `brands`/`flavors` (arrays); the frontend still reads both.
- Reviews use three tables created in `createTables()`: `comments` (`rating` CHECK 1–5, `status` CHECK `UNANSWERED|ANSWERED`, `edited_by_admin`, `UNIQUE(user_id, product_id)` = one review per user per product), `replies` (`UNIQUE(comment_id)` = one admin reply per comment) and `comment_votes` (`type` CHECK `LIKE|DISLIKE`, `UNIQUE(comment_id, user_id)`). Foreign keys use `ON DELETE CASCADE` from products and comments, so deleting a comment removes its reply and votes and deleting a product removes its comments (Postgres enforces foreign keys by default).
- **`products.rating` and `review_count` are derived from comments** (average rounded to one decimal, and the count). `CommentsService` recalculates them whenever a comment is created or deleted; they are not part of the product create/update inputs. Do not write them anywhere else.
- `db/schema.ts` also has a `users` table mirror for Drizzle joins; `UserService` now goes through Drizzle's query builder against it (no more raw SQL / `this.db["sqlite"]`), mapping rows back to the legacy snake_case shape (`provider_id`, `is_active`, ...) that `user.entity.ts`, `auth.resolver.ts` and `session.service.ts` still expect, so the GraphQL `User` type's field names did not need to change.
- Every service method that touches the database is now `async` (Postgres via `drizzle-orm/node-postgres` has no synchronous `.all()`/`.get()`/`.run()` — only `await db.select()...`, `[0]` for a single row, and `await db.insert/update/delete(...)`). Resolvers already `return` these calls from `async` resolver methods, so GraphQL awaits them correctly either way; `shop.resolver.ts` additionally spells out `await` explicitly.
- `ShopService` (cart + orders) and `CommentsService` (reviews) wrap multi-statement writes in `await this.database.db.transaction(async (tx) => { ... })`, using `tx` (not the outer `db`) for every statement inside the callback, replacing the old synchronous `better-sqlite3` transaction.

### API surface (all under `POST /graphql`)

- Products: `products(category?)`, `product(slug)`, `createProduct`, `updateProduct(slug,input)`, `removeProduct(slug)`
- Categories: `categories`, `category(slug)`, `create/update/removeCategory` (by slug)
- Sliders: `sliders`, `slider(id)`, `create/update/removeSlider` (by id)
- Flavors / Brands: `flavors|brands`, `create/update/remove*` (by id)
- Users: `users`, `user(id)`, `createUser`, `updateUser`, `setUserActive`
- Auth: `signup`, `login` -> `{ token, user }`; `profile` / `olderLoginOAuth` (oauth2-guarded, non-functional)
- Shop (need `Authorization: Bearer <token>`): `myCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart`, `createOrderFromCart`, `myOrders`
- Comments (reviews):
  - `productReviews(productSlug)` — public; returns `{ average, count, distribution[5], comments[] }`, and each comment carries `myVote` only when a valid token is sent
  - `adminComments(status?)` — admin; no status = all, or `UNANSWERED` / `ANSWERED`
  - `createComment(input: { productSlug, rating, content })` — signed-in user; the author is the token's user
  - `voteComment(commentId, type: LIKE|DISLIKE)` — signed-in user or admin; one rule: same type again removes the vote, the other type switches it
  - `replyToComment(commentId, content)`, `updateComment(commentId, content)`, `removeComment(commentId)` — admin only; the first sets status to `ANSWERED` in the same transaction, the second sets `editedByAdmin` and touches only the text
  - Validation: rating is an integer 1–5, text is trimmed and 1–2000 characters, error messages are Persian. `Comment` exposes the author's name only, never email or password
- REST: `POST /upload` (multipart field `file`) -> `{ success, url }`; static files from `./public` (uploads at `/uploads/<file>`)

Numeric ids are declared as `number` args, so the schema types them as `Float!` — the frontend passes `Float!` for id variables.

## Gotchas / known limitations (verify before relying on or "fixing" silently)

- **Only some resolvers are protected.** Shop and comments use `SessionService`. Product/category/slider/brand/flavor/user mutations, the `users` query and `POST /upload` are still callable by anyone — adding `requireAdmin` to each is a one-line change per resolver, but it has not been done. The frontend's `AdminGuard` is a client-side convenience only.
- Tokens are HMAC-signed with expiry (see Authentication and permissions), but they are not standard JWTs and there is no refresh or revocation beyond disabling the user.
- **Passwords are stored and compared in plaintext**, and `User.password` is exposed in the GraphQL `User` type / `login` response. An admin account with hardcoded credentials is seeded in `DatabaseService.seed()`.
- `OAuth2Strategy` has placeholder URLs/credentials (`YOUR_CLIENT_ID`, ...) and ignores the `OAUTH_*` env vars. It is instantiated at boot but only reachable via the guarded queries above.
- `GraphiqlController` is **not registered in any module**, so `/graphiql` returns 404. Apollo's default landing page at `/graphql` (non-production) is the explorer to use; if you want `/graphiql`, add `GraphiqlController` to a module's `controllers`.
- `POST /upload` has no auth, size limit or MIME filter, and writes to `./public/uploads` relative to the process cwd (run from `backend/`; multer creates the directory). Files keep the original extension.
- `npm run lint` will fail with no config: ESLint 9 needs an `eslint.config.*`, and none is present in `backend/`.
- `docker-compose.yml`'s `postgres` service is now what the backend actually targets for local dev (`docker compose up -d postgres` from `showcase/`, then point `DATABASE_URL` at `postgresql://your_username:your_password@localhost:5432/your_database`); its named volume (`pgdata`) is already how Postgres persists data, no filesystem bind mount needed for `data/` the way SQLite needed. `./public/uploads` still needs a writable volume/mount if uploads should survive a container restart.
- `pg` is a pure-JS driver (no native build step), unlike the old `better-sqlite3` — no `npm rebuild`, no pnpm `approve-builds` dance for the database driver itself.
- There is no pagination: `productReviews` and `adminComments` return every matching comment.
- Root `package.json` lists unrelated deps (typeorm, pg, type-graphql, apollo-server-express 3); nothing in `backend/` uses them (the `backend/package.json` `pg` dependency is separate and is used).
- Serverless/Vercel: the backend is deployed as Vercel serverless functions, whose filesystem is ephemeral/read-only — this is *why* persistence moved off a local SQLite file to an external Postgres (Neon, Supabase, Vercel Postgres, etc.) reachable via `DATABASE_URL`. Each cold start creates a fresh `pg.Pool`; there's no connection-pooling tier (e.g. PgBouncer) wired up, so a provider with built-in serverless pooling (or a pooled connection string) is worth using in production.

## Style

TypeScript strict, CommonJS output, `experimentalDecorators` + `emitDecoratorMetadata`. Double quotes, semicolons, 2-space indent (Prettier defaults). Services are `async` throughout (Postgres via `drizzle-orm/node-postgres` has no synchronous query methods); resolvers just delegate. Throw Nest exceptions (`NotFoundException`, `UnauthorizedException`) for expected errors.
