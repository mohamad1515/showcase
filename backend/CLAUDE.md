# CLAUDE.md — backend

NestJS 11 + GraphQL (code-first, Apollo Server 5, Express 5) API for a Persian-language supplements shop. Persistence is SQLite via `better-sqlite3`, with Drizzle ORM used for queries. Consumed by `../frontend`.

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

There is only one spec today: `src/shop/pricing.spec.ts`. Use `node:test` + `node:assert/strict` for new specs, not Jest.

## Configuration

Read directly from `process.env` (no ConfigModule, no dotenv import — `.env` is only loaded if the runner does it). Copy `.env.example` to `.env`.

| Var | Default | Used by |
| --- | --- | --- |
| `PORT` | `4000` | `main.ts`, upload URL fallback |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin (`credentials: true`) |
| `BACKEND_PUBLIC_URL` | `http://localhost:$PORT` | startup logs, upload response URL |
| `DATABASE_URL` | `<cwd>/data/showcase.sqlite` | **A plain file path**, not a URL |

`DATABASE_URL` must be a filesystem path. The root `.env.example` (`sqlite:./data/...`) and `docker-compose.yml` (`postgresql://...`) give values this code cannot open. Use `backend/.env.example` as the source of truth.

The default port is 4000. Frontend config and `next.config.ts` image patterns assume `localhost:4000`.

## Architecture

```
src/
  main.ts            bootstrap: CORS, static assets from ./public, listen
  app.module.ts      GraphQLModule.forRoot (autoSchemaFile: true, context => { req }) + feature modules
  db/                DatabaseModule/DatabaseService (connection, DDL, seed), schema.ts (Drizzle), seed*.ts
  auth/              signup/login mutations, oauth2 passport strategy (placeholder)
  user/              User entity, inputs, service, resolver (registered in AuthModule, not its own module)
  products|categories|sliders|flavors|brands/   *.model.ts, *.input.ts, *.service.ts, *.resolver.ts, *.module.ts
  shop/              cart + orders (resolver, service, pricing.ts helpers, spec)
  upload/            POST /upload (multer disk storage -> ./public/uploads)
  graphiql.controller.ts   see Gotchas
```

Per-feature convention: `*.model.ts` (`@ObjectType`), `*.input.ts` (`@InputType`), `*.service.ts` (Drizzle queries), `*.resolver.ts` (thin), `*.module.ts`. Follow it for new domains and add the module to `AppModule.imports`.

The GraphQL schema is generated from decorators at startup (`autoSchemaFile: true` = in memory, no `schema.gql` on disk). Any change to a `@Field` shows up in the schema on restart, and `../frontend/app/lib/graphql.ts` holds hand-written query strings that must be updated to match.

### Database

- `DatabaseService` (`db/database.service.ts`) owns the connection and runs on `onModuleInit`: sets WAL, runs `CREATE TABLE IF NOT EXISTS` for every table, then `ensureColumn` migrations, then `migrateProductSlugs()`, then `seed()`.
- **There is no migration tool.** The raw DDL in `createTables()` and the Drizzle definitions in `db/schema.ts` are two separate sources of truth and must be edited together. To add a column: update `schema.ts`, add an `ensureColumn(...)` call, and if the table is new add its `CREATE TABLE`.
- `createTables()` **drops the `products` table** if it lacks a `persian_name` column (legacy-schema reset). Do not rename that column without revisiting this.
- Seed on every boot (`INSERT OR IGNORE`): one admin user, two categories (`sports-supplements`, `food-supplements`), one slider. Products are not seeded (`db/seed.ts` only creates empty tables; `db/seed-data.ts` is not used by boot).
- Money is stored as **formatted strings** (e.g. `"1,250,000"`), and list-like fields (`features`, `tags`, `brands`, `flavors`, `galleryImages`) as JSON text columns. Arithmetic goes through `shop/pricing.ts`, which strips non-digits — decimals are not supported.
- Product `slug` is derived from `englishName` (`generateSlug`) and re-derived on rename; `migrateProductSlugs()` re-normalizes all slugs on every boot.
- `products.brand`/`flavor` (single) coexist with `brands`/`flavors` (arrays); the frontend still reads both.

### API surface (all under `POST /graphql`)

- Products: `products(category?)`, `product(slug)`, `createProduct`, `updateProduct(slug,input)`, `removeProduct(slug)`
- Categories: `categories`, `category(slug)`, `create/update/removeCategory` (by slug)
- Sliders: `sliders`, `slider(id)`, `create/update/removeSlider` (by id)
- Flavors / Brands: `flavors|brands`, `create/update/remove*` (by id)
- Users: `users`, `user(id)`, `createUser`, `updateUser`, `setUserActive`
- Auth: `signup`, `login` -> `{ token, user }`; `profile` / `olderLoginOAuth` (oauth2-guarded, non-functional)
- Shop (need `Authorization: Bearer <token>`): `myCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart`, `createOrderFromCart`, `myOrders`
- REST: `POST /upload` (multipart field `file`) -> `{ success, url }`; static files from `./public` (uploads at `/uploads/<file>`)

Numeric ids are declared as `number` args, so the schema types them as `Float!` — the frontend passes `Float!` for id variables.

## Gotchas / known limitations (verify before relying on or "fixing" silently)

- **No authorization on GraphQL.** Only the shop resolver checks a token. Product/category/slider/brand/flavor/user mutations and the `users` query are callable by anyone. The frontend's `AdminGuard` is client-side only.
- **The "token" is not a JWT**: `base64("<userId>:<timestamp>")`, unsigned and never expires; `ShopResolver.currentUserId` decodes it. Anyone can forge a token for any user id.
- **Passwords are stored and compared in plaintext**, and `User.password` is exposed in the GraphQL `User` type / `login` response. An admin account with hardcoded credentials is seeded in `DatabaseService.seed()`.
- `OAuth2Strategy` has placeholder URLs/credentials (`YOUR_CLIENT_ID`, ...) and ignores the `OAUTH_*` env vars. It is instantiated at boot but only reachable via the guarded queries above.
- `GraphiqlController` is **not registered in any module**, so `/graphiql` returns 404. Apollo's default landing page at `/graphql` (non-production) is the explorer to use; if you want `/graphiql`, add `GraphiqlController` to a module's `controllers`.
- `POST /upload` has no auth, size limit or MIME filter, and writes to `./public/uploads` relative to the process cwd (run from `backend/`; multer creates the directory). Files keep the original extension.
- `npm run lint` will fail with no config: ESLint 9 needs an `eslint.config.*`, and none is present in `backend/`.
- `docker-compose.yml` wires a Postgres service that the backend does not use; the container needs a writable volume for `data/` and `public/uploads` if data should persist.
- `better-sqlite3` is a native module (the Dockerfile installs python3/make/g++). After switching Node versions, run `npm rebuild better-sqlite3`.
- Root `package.json` lists unrelated deps (typeorm, pg, type-graphql, apollo-server-express 3); nothing in `backend/` uses them.

## Style

TypeScript strict, CommonJS output, `experimentalDecorators` + `emitDecoratorMetadata`. Double quotes, semicolons, 2-space indent (Prettier defaults). Services are synchronous where Drizzle+better-sqlite3 allows; resolvers just delegate. Throw Nest exceptions (`NotFoundException`, `UnauthorizedException`) for expected errors.
